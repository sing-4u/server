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
}
