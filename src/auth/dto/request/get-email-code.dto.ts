import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class GetEmailCodeDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
