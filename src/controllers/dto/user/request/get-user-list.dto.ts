import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Length, IsOptional } from 'class-validator';

export class GetUsersRequest {
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    description: '없으면 처음부터',
  })
  @IsOptional()
  @Length(1)
  cursor?: string | null;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Length(1)
  name?: string;
}
