import { ApiProperty } from '@nestjs/swagger';
import {
  Length,
  IsOptional,
  IsUrl,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class LinkDto {
  @ApiProperty({ example: '인스타그램' })
  @Length(1, 20)
  linkName: string;

  @ApiProperty({ example: 'https://www.instagram.com/username' })
  @IsUrl()
  url: string;
}

export class UpdateProfileDto {
  @ApiProperty({ minLength: 1, maxLength: 20 })
  @Length(1, 20)
  name: string;

  @ApiProperty({ minLength: 0, maxLength: 80, nullable: true })
  @Transform(({ value }) => {
    if (!value || !(typeof value === 'string') || value.trim().length === 0) {
      return null;
    }
    return value.trim();
  })
  @IsOptional()
  @Length(1, 80)
  bio?: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsUrl()
  cover: string | null;

  @ApiProperty({
    type: LinkDto,
    isArray: true,
    nullable: true,
  })
  @Transform(({ value }) => (value === null ? [] : value))
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links: LinkDto[];
}
