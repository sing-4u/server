import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

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

  // TO REMOVE
  async getArtists({
    index,
    sort,
    search,
  }: {
    index: number;
    sort: 'latest' | 'isOpen' | 'songListCount';
    search?: string;
  }) {
    let orderBy: Prisma.UserOrderByWithRelationInput;
    if (sort === 'latest') {
      orderBy = {
        createdAt: 'desc',
      };
    } else if (sort === 'isOpen') {
      orderBy = {
        isOpened: 'desc',
      };
    } else {
      orderBy = {
        SongList: {
          _count: 'desc',
        },
      };
    }

    let where: Prisma.UserWhereInput = {};
    if (search) {
      where = {
        name: {
          contains: search,
        },
      };
    }
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        isOpened: true,
        _count: {
          select: {
            SongList: true,
          },
        },
      },
      orderBy,
      skip: index * 10,
      take: 10,
      where,
    });
  }

  async getArtist(id: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
      },
    });
  }

  async getRequest(email: string) {
    return await this.prisma.song.findMany({
      where: {
        email,
      },
      select: {
        artist: true,
        title: true,
        createdAt: true,
        songList: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getSongList(id: string) {
    return await this.prisma.songList.findMany({
      where: {
        userId: id,
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        songs: {
          select: {
            artist: true,
            title: true,
            createdAt: true,
            email: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }
}
