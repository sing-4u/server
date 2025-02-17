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
    { email, password }: { email: string; password?: string },
  ) {
    const user = await this.userRepository.findOneWithPasswordById(userId);
    if (user.password) {
      if (!password) {
        throw new HttpException('비밀번호를 입력해주세요.', 400);
      }
      const isValidPassword = await argon2.verify(user.password, password);
      if (!isValidPassword) {
        throw new HttpException('비밀번호가 일치하지 않습니다.', 401);
      }
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

  async deleteProfileImage(userId: string) {
    await this.userRepository.updateProfileImage(userId, null);
    return;
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

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    if (user.image) {
      await this.awsService.deleteProfileImage(user.image);
    }
    await this.userRepository.deleteOne(userId);
    return;
  }

  async getAll(query: { index: number; size: number }) {
    let users = await this.userRepository.findAll(query);
    users = users.map((user) => {
      if (user.image) {
        return {
          ...user,
          image: this.awsService.getProfileImageUrl(user.image),
        };
      }
      return user;
    });

    return users;
  }

  async getAllByName(query: { index: number; size: number; name: string }) {
    let users = await this.userRepository.findAllByName(query);
    users = users.map((user) => {
      if (user.image) {
        return {
          ...user,
          image: this.awsService.getProfileImageUrl(user.image),
        };
      }
      return user;
    });

    return users;
  }

  async getForm(userId: string) {
    const user = await this.userRepository.findOneById(userId);

    return {
      id: user.id,
      name: user.name,
      image: user.image ? this.awsService.getProfileImageUrl(user.image) : null,
      isOpened: user.isOpened,
    };
  }

  async getOne(userId: string) {
    const user = await this.userRepository.findOneById(userId);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image ? this.awsService.getProfileImageUrl(user.image) : null,
      isOpened: user.isOpened,
    };
  }
}
