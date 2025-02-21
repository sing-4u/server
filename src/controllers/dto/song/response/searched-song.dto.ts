import { ApiProperty } from '@nestjs/swagger';

export class SearchedSongDto {
  @ApiProperty({ example: 'IU' })
  artist: string;

  @ApiProperty({ example: '좋은 날' })
  title: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  image: string;
}
