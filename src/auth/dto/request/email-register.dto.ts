import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, Length, IsBoolean } from 'class-validator';

export class EmailRegisterDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  // 영문, 숫자, 특수문자 하나씩 포함한 8자 이상 16자리 이하
  @ApiProperty({
    description: '영문, 숫자, 특수문자 하나씩 포함한 8자 이상 16자리 이하',
  })
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
  )
  readonly password: string;

  @ApiProperty({ minLength: 1, maxLength: 20 })
  @Length(1, 20)
  readonly name: string;

  @ApiProperty()
  @IsBoolean()
  readonly isArtist: boolean;
}
