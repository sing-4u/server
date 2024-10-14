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

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new HttpException('존재하지 않는 유저입니다', 404);
    }
    return user;
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

  async findOneWithPasswordById(userId: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { password: true },
    });
  }

  async updatePassword(userId: string, password: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { password },
    });
    return;
  }

  async findOneById(id: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        provider: true,
      },
    });
  }

  async updateProfileImage(userId: string, image: string | null) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { image },
    });
    return;
  }

  async saveEmailCode(email: string, code: string) {
    try {
      await this.prisma.emailCode.upsert({
        where: { email },
        update: { code, createdAt: new Date() },
        create: { email, code },
      });
      return;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new HttpException('존재하지 않는 이메일입니다.', 404);
        }
      }
      throw error;
    }
  }

  async findUserByEmailCode(email: string, code: string) {
    const emailCode = await this.prisma.emailCode.findUnique({
      where: {
        email,
        createdAt: {
          // 10분 전
          gte: new Date(Date.now() - 1000 * 60 * 10),
        },
        code,
      },
      select: {
        user: {
          select: { id: true },
        },
      },
    });
    if (!emailCode) {
      throw new HttpException('인증 코드가 만료되었습니다.', 401);
    }
    return emailCode;
  }

  async deleteOne(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return;
  }

  async findAll({ index, size }: { index: number; size: number }) {
    return await this.prisma.user.findMany({
      skip: index * size,
      take: size,
      select: {
        id: true,
        name: true,
        image: true,
        status: true,
      },
      orderBy: {
        status: 'desc',
      },
    });
  }

  async findAllByName({
    index,
    size,
    name,
  }: {
    index: number;
    size: number;
    name: string;
  }) {
    return await this.prisma.user.findMany({
      skip: index * size,
      take: size,
      select: {
        id: true,
        name: true,
        image: true,
        status: true,
      },
      where: {
        name: {
          contains: name,
        },
      },
      orderBy: {
        status: 'desc',
      },
    });
  }
}
