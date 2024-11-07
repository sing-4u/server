import { ApiProperty } from '@nestjs/swagger';

export class RequestFormDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: 'string' })
  image: string | null;

  @ApiProperty()
  isOpened: boolean;
}
