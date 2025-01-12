import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({
    nullable: true,
    type: 'string',
    example: 'https://example.com/image.png',
  })
  image: string | null;

  @ApiProperty()
  isOpened: boolean;
}
