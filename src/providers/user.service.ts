import { Injectable, HttpException } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async updateName(userId: string, name: string) {
    await this.userRepository.updateName(userId, name);
    return;
  }

  async updateEmail(
    userId: string,
    { email, password }: { email: string; password: string },
  ) {
    const storedPassword = await this.userRepository.findPasswordById(userId);
    const isValidPassword = await argon2.verify(storedPassword, password);
    if (!isValidPassword) {
      throw new HttpException('비밀번호가 일치하지 않습니다.', 401);
    }
    await this.userRepository.updateEmail(userId, email);
    return;
  }
}
