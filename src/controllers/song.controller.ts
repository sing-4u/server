import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  Body,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
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
import { CloseDto, RequestSongDto } from './dto/song/request';
import { SongListResponseDto, SongListDetailDto } from './dto/song/response';

@ApiTags('songs')
@ApiResponse({ status: 400, description: '유효성 검사 실패' })
@ApiResponse({ status: 401, description: '인증 실패' })
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

  @ApiOperation({ summary: '곡 신청' })
  @ApiBody({ type: RequestSongDto })
  @ApiResponse({ status: 201, description: '곡 신청 성공' })
  @ApiResponse({ status: 404, description: 'OPENED 상태가 아님' })
  @ApiResponse({ status: 409, description: '이미 신청한 곡' })
  @Post()
  async requestSong(@Body() requestSongDto: RequestSongDto) {
    await this.songService.requestSong(requestSongDto);
    return;
  }

  @ApiOperation({ summary: '내 songList 전체 조회' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: SongListResponseDto, isArray: true })
  @Get('mylist')
  @UseGuards(JwtGuard)
  async getMyList(
    @CurrentUser() userId: string,
  ): Promise<SongListResponseDto[]> {
    return await this.songService.getSongList(userId);
  }

  @ApiOperation({ summary: 'songList 상세 조회' })
  @ApiResponse({ status: 200, type: SongListDetailDto, isArray: true })
  @Get('mylist/:songListId')
  async getMyListDetail(
    @Param('songListId', new ParseUUIDPipe()) songListId: string,
  ): Promise<SongListDetailDto[]> {
    return await this.songService.getSongListDetail(songListId);
  }
}
