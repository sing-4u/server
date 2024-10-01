import { ApiProperty } from '@nestjs/swagger';

export class UpdateImageDto {
  @ApiProperty({
    format: 'binary',
    description: '이미지 파일',
  })
  image: Express.Multer.File;
}
