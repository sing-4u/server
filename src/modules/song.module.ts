import { Module } from '@nestjs/common';
import { SongController } from 'src/controllers/song.controller';
import { SongService } from 'src/providers/song.service';
import { SongRepository } from 'src/repositories/song.repository';

@Module({
  controllers: [SongController],
  providers: [SongService, SongRepository],
})
export class SongModule {}
