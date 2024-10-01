import { ApiProperty } from '@nestjs/swagger';

export class UpdatePetImageDto {
  @ApiProperty({
    format: 'binary',
    description: '이미지 파일',
  })
  image: Express.Multer.File;
}
