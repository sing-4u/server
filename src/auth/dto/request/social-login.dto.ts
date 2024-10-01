import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class SocialLoginDto {
  @ApiProperty({ enum: ['GOOGLE'] })
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(['GOOGLE'])
  provider: 'GOOGLE';

  @ApiProperty({ description: '소셜 로그인 코드' })
  @IsString()
  @IsNotEmpty()
  providerCode: string;
}