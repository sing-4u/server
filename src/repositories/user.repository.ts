import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async createByEmail(createInput: {
    provider: string;
    email: string;
    password: string;
    name: string;
  }) {
    try {
      return await this.prisma.user.create({
        data: createInput,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException('이미 존재하는 이메일입니다.', 409);
        }
      }
      throw error;
    }
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async findRefreshToken(userId: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { refreshToken: true },
    });
  }

  async findOneEmailUser(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        provider: 'EMAIL',
        email,
      },
    });
    if (!user) {
      throw new HttpException('존재하지 않는 유저입니다', 404);
    }
    return user;
  }

  async findOneByProvider(provider: string, providerId: string) {
    return await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });
  }

  async createByProvider(createInput: {
    provider: string;
    providerId: string;
    email: string;
    name: string;
  }) {
    try {
      return await this.prisma.user.create({
        data: createInput,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException('이미 존재하는 이메일입니다.', 409);
        }
      }
      throw error;
    }
  }

  async updateName(userId: string, name: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    return;
  }

  async updateEmail(userId: string, email: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { email },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException('이미 존재하는 이메일입니다.', 409);
        }
      }
      throw error;
    }
    return;
  }

  async findPasswordById(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { password: true },
    });
    return user.password!;
  }
}
