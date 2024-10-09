import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, MinLength, MaxLength } from 'class-validator';

export class EmailRegisterDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  // 영문, 숫자, 특수문자 하나씩 포함한 8자 이상 16자리 이하
  @ApiProperty()
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
  )
  readonly password: string;

  @ApiProperty()
  @MinLength(1)
  @MaxLength(20)
  readonly name: string;
}
