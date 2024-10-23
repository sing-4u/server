import { ApiProperty } from '@nestjs/swagger';

export class SongListResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty({ nullable: true, type: Date })
  endDate: Date | null;
}
