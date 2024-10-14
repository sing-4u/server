import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class RequestSongDto {
  @ApiProperty({ description: '신청받는 유저의 ID' })
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: '가수 이름' })
  @IsString()
  @IsNotEmpty()
  artist: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}
