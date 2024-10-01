import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async updateName(userId: string, name: string) {
    await this.userRepository.updateName(userId, name);
    return;
  }
}
