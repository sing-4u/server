import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsEmail, Length } from 'class-validator';

export class RequestSongDto {
  @ApiProperty({ description: '신청받는 유저의 ID' })
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: '가수 이름' })
  @IsString()
  @Length(1, 50)
  artist: string;

  @ApiProperty()
  @IsString()
  @Length(1, 50)
  title: string;
}
