import { Injectable, HttpException } from '@nestjs/common';
import { SongRepository } from 'src/repositories/song.repository';

@Injectable()
export class SongService {
  constructor(private songRepository: SongRepository) {}
  async open(userId: string) {
    const canOpen = await this.songRepository.canOpen(userId);
    if (!canOpen) {
      throw new HttpException('이미 오픈된 유저입니다.', 409);
    }

    await this.songRepository.open(userId);
    return;
  }

  async close(userId: string, songListId: string) {
    await this.songRepository.close(userId, songListId);
    return;
  }

  async requestSong(requestSongInput: {
    userId: string;
    email: string;
    artist: string;
    title: string;
  }) {
    const recentSongList = await this.songRepository.findOneRecentSongList(
      requestSongInput.userId,
    );

    if (!recentSongList) {
      throw new HttpException('열려있는 신청곡이 없습니다.', 404);
    }

    await this.songRepository.createSong({
      songListId: recentSongList.id,
      email: requestSongInput.email,
      artist: requestSongInput.artist,
      title: requestSongInput.title,
    });
    return;
  }

  async getSongList(userId: string) {
    return await this.songRepository.findManySongList(userId);
  }
}
