import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length } from 'class-validator';

export class VerifyEmailCodeDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @Length(6, 6)
  code: string;
}
