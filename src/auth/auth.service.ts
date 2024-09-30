import { Injectable, HttpException } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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

  async loginEmail(email: string, password: string) {
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
}
