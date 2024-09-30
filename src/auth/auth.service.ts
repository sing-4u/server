import { Injectable } from '@nestjs/common';
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
}
