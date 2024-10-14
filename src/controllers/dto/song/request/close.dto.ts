import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CloseDto {
  @ApiProperty()
  @IsUUID()
  songListId: string;
}
