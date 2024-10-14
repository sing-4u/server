import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
