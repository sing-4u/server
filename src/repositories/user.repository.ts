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
}
