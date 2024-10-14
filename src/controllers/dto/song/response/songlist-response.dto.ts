import { ApiProperty } from '@nestjs/swagger';

export class Song {
  @ApiProperty()
  artist: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  count: number;
}

export class SongListResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty({ nullable: true, type: Date })
  endDate: Date | null;

  @ApiProperty({ type: Song, isArray: true })
  songs: Song[];
}
