import { Module } from '@nestjs/common';
import { SongController } from 'src/controllers/song.controller';
import { SongService } from 'src/providers/song.service';
import { SongRepository } from 'src/repositories/song.repository';
import { SpotifyService } from 'src/providers/spotify.service';

@Module({
  controllers: [SongController],
  providers: [SongService, SongRepository, SpotifyService],
  exports: [SongRepository],
})
export class SongModule {}
