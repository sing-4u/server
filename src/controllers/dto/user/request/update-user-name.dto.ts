import { ApiProperty } from '@nestjs/swagger';
import { MinLength, MaxLength } from 'class-validator';

export class UpdateUserNameDto {
  @ApiProperty()
  @MinLength(1)
  @MaxLength(50)
  readonly name: string;
}
