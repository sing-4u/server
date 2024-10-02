import { Injectable, HttpException } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { AwsService } from './aws.service';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private awsService: AwsService,
  ) {}

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

  async updatePassword(
    userId: string,
    { oldPassword, newPassword }: { oldPassword: string; newPassword: string },
  ) {
    const storedPassword = await this.userRepository.findPasswordById(userId);
    const isValidPassword = await argon2.verify(storedPassword, oldPassword);

    if (!isValidPassword) {
      throw new HttpException('비밀번호가 일치하지 않습니다.', 401);
    }

    const hashedPassword = await argon2.hash(newPassword);
    await this.userRepository.updatePassword(userId, hashedPassword);
    return;
  }

  async updateProfileImage(
    userId: string,
    file?: Express.Multer.File,
  ): Promise<{ image: string | null }> {
    const user = await this.userRepository.findOneById(userId);

    if (user.image) {
      await this.awsService.deleteProfileImage(user.image);
    }

    if (!file) {
      await this.userRepository.updateProfileImage(userId, null);
      return { image: null };
    } else {
      const ext = file.originalname.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      await this.awsService.uploadProfileImage(filename, file);
      await this.userRepository.updateProfileImage(userId, filename);
      return {
        image: this.awsService.getProfileImageUrl(filename),
      };
    }
  }

  async getMyInfo(userId: string) {
    let user = await this.userRepository.findOneById(userId);
    if (user.image) {
      user = {
        ...user,
        image: this.awsService.getProfileImageUrl(user.image),
      };
    }
    return user;
  }
}
