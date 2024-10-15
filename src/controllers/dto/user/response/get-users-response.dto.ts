import { ApiProperty } from '@nestjs/swagger';

export class GetUsersResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    nullable: true,
    type: 'string',
  })
  image: string | null;

  @ApiProperty()
  isOpened: boolean;
}
