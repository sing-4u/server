import { IsNumber, IsString, IsOptional } from 'class-validator';

export class GetUserListDto {
  @IsNumber()
  index: number;

  @IsNumber()
  size: number;

  @IsOptional()
  @IsString()
  name?: string;
}
