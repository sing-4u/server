import { Length } from 'class-validator';

export class AdminLoginDto {
  @Length(1, 20)
  id: string;

  @Length(8, 20)
  password: string;
}
