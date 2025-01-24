import { IsEmail, Length, IsEnum } from 'class-validator';

export class AdminRegisterDto {
  @Length(1, 20)
  id: string;

  @Length(1, 20)
  name: string;

  @IsEmail()
  email: string;

  @Length(8, 20)
  password: string;

  @IsEnum(['SUPER', 'NORMAL'])
  role: string;
}
