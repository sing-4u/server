import { ApiProperty } from '@nestjs/swagger';

export class SongListDetailDto {
  @ApiProperty()
  artist: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  count: number;
}
