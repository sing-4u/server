import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SongRepository {
  constructor(private prisma: PrismaService) {}

  async canOpen(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { status: true },
    });
    if (user.status === 'CLOSED') {
      return true;
    }
    return false;
  }

  async open(userId: string) {
    await this.prisma.$transaction([
      this.prisma.songList.create({
        data: {
          userId,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { status: 'OPENED' },
      }),
    ]);
    return;
  }

  async close(userId: string, songListId: string) {
    await this.prisma.$transaction([
      this.prisma.songList.update({
        where: { id: songListId, userId, endDate: null },
        data: { endDate: new Date() },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { status: 'CLOSED' },
      }),
    ]);
    return;
  }

  async findOneRecentSongList(userId: string) {
    return await this.prisma.songList.findFirst({
      where: { userId, endDate: null },
      orderBy: { startDate: 'desc' },
    });
  }

  async createSong(requestSongInput: {
    songListId: string;
    email: string;
    artist: string;
    title: string;
  }) {
    try {
      await this.prisma.song.create({
        data: {
          songListId: requestSongInput.songListId,
          email: requestSongInput.email,
          artist: requestSongInput.artist,
          title: requestSongInput.title,
        },
      });
      return;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new HttpException('이미 신청한 곡입니다.', 409);
      }
    }
  }
}
