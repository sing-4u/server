import { ApiProperty } from '@nestjs/swagger';

export class ImageDto {
  @ApiProperty({
    description: '이미지 URL',
    nullable: true,
    type: 'string',
    example: 'https://example.com/image.png',
  })
  image: string | null;
}
