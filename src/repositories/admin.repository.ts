import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) {}

  async create(input: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    return this.prisma.admin.create({
      data: input,
    });
  }

  async findOne(id: string) {
    return this.prisma.admin.findUniqueOrThrow({
      where: { id },
    });
  }

  async getAdmins() {
    return this.prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async deleteOne(id: string) {
    await this.prisma.admin.delete({
      where: { id },
    });
    return;
  }

  async updateOne(
    id: string,
    input: {
      name: string;
      email: string;
      password: string;
      role: string;
    },
  ) {
    await this.prisma.admin.update({
      where: { id },
      data: input,
    });
  }
}
