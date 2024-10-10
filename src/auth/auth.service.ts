import { Injectable, HttpException } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async registerEmail(registerInput: {
    email: string;
    password: string;
    name: string;
  }) {
    const hashedPassword = await argon2.hash(registerInput.password);
    const { id } = await this.userRepository.createByEmail({
      provider: 'EMAIL',
      email: registerInput.email,
      password: hashedPassword,
      name: registerInput.name,
    });

    const accessToken = this.createAccessToken(id);
    const refreshToken = this.createRefreshToken(id);

    await this.userRepository.saveRefreshToken(id, refreshToken);

    return { accessToken, refreshToken };
  }

  async emailLogin(email: string, password: string) {
    const user = await this.userRepository.findOneEmailUser(email);
    const isValidPassword = await argon2.verify(user.password!, password);

    if (!isValidPassword) {
      throw new HttpException('Password is invalid', 401);
    }

    const accessToken = this.createAccessToken(user.id);
    const refreshToken = this.createRefreshToken(user.id);

    await this.userRepository.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  createAccessToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }

  createRefreshToken(userId: string) {
    return this.jwtService.sign(
      { id: userId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      },
    );
  }

  async refresh(userId: string, refreshToken: string) {
    const { refreshToken: storedRefreshToken } =
      await this.userRepository.findRefreshToken(userId);

    if (refreshToken !== storedRefreshToken) {
      throw new HttpException('Refresh token is invalid', 401);
    }

    const newAccessToken = this.createAccessToken(userId);
    const newRefreshToken = this.createRefreshToken(userId);

    await this.userRepository.saveRefreshToken(userId, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async socialLogin(provider: 'GOOGLE', providerCode: string) {
    const googleAccessToken = await this.getGoogleAccessToken(providerCode);
    const profile = await this.getGoogleProfile(googleAccessToken);

    let user = await this.userRepository.findOneByProvider(
      provider,
      profile.id,
    );

    if (!user) {
      user = await this.userRepository.createByProvider({
        provider,
        providerId: profile.id,
        email: profile.email,
        name: profile.email.split('@')[0],
      });
    }

    const accessToken = this.createAccessToken(user.id);
    const refreshToken = this.createRefreshToken(user.id);

    await this.userRepository.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async getGoogleAccessToken(code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: this.configService.get('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.configService.get('GOOGLE_REDIRECT_URI'),
        grant_type: 'authorization_code',
      }),
    });
    const data = await response.json();
    if (!data.access_token) {
      throw new HttpException('Invalid code', 400);
    }
    return data.access_token;
  }

  async getGoogleProfile(accessToken: string) {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
    );
    const data = (await response.json()) as GoogleProfile;
    if (!data.id) {
      throw new HttpException('Invalid access token', 500);
    }
    return data;
  }

  async sendEmailCode(email: string) {
    const user = await this.userRepository.findOneByEmail(email);
    if (user.provider !== 'EMAIL') {
      throw new HttpException('이메일로 회원가입 한 유저가 아닙니다', 403);
    }

    const code = this.generateEmailCode();

    await this.userRepository.saveEmailCode(email, code);
    await this.sendEmail(email, code);
    return;
  }

  generateEmailCode() {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      arr.push(Math.floor(Math.random() * 10));
    }
    return arr.join('');
  }

  async sendEmail(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });

    const mailOptions = {
      from: this.configService.get('MAIL_USER'),
      to: email,
      subject: '이메일 코드',
      text: code,
    };

    await transporter.sendMail(mailOptions);
  }
}

export type GoogleProfile = {
  id: string;
  email: string;
  verified_email: boolean;
  picture: string;
};
