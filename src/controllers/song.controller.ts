import { Controller, Post, UseGuards, HttpCode, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards';
import { CurrentUser } from 'src/common/decorators';
import { SongService } from 'src/providers/song.service';
import { CloseDto } from './dto/song/request';

@ApiTags('songs')
@Controller('songs')
export class SongController {
  constructor(private songService: SongService) {}

  @ApiOperation({ summary: '신청곡 열기' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: '신청곡 열기 성공' })
  @ApiResponse({ status: 409, description: '이미 오픈된 유저입니다.' })
  @Post('open')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async open(@CurrentUser() userId: string) {
    await this.songService.open(userId);
    return;
  }

  @ApiOperation({ summary: '신청곡 닫기' })
  @ApiBearerAuth()
  @ApiBody({ type: CloseDto })
  @ApiResponse({ status: 204, description: '신청곡 닫기 성공' })
  @Post('close')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async close(@CurrentUser() userId: string, @Body() { songListId }: CloseDto) {
    await this.songService.close(userId, songListId);
    return;
  }
}
