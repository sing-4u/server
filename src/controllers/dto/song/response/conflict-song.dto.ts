import { ApiProperty } from '@nestjs/swagger';

export class ConflictSongDto {
  @ApiProperty()
  artist: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  email: string;
}

export class ConflictResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  detail: ConflictSongDto;
}
