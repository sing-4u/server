import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class UpdatePassWordByCodeDto {
  @ApiProperty()
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
  )
  newPassword: string;
}
