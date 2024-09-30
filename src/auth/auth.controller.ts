import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { EmailRegisterDto } from './dto/request';
import { JwtTokenDto } from './dto/request/response';
import { AuthService } from './auth.service';
import { JwtGuard, RefreshGuard } from './guards';
import { CurrentUser } from 'src/common/pipes/decorators';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '이메일 회원가입' })
  @ApiBody({ type: EmailRegisterDto })
  @ApiResponse({ status: 201, description: '회원가입 성공', type: JwtTokenDto })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  @Post('register/email')
  async registerEmail(
    @Body() registerDto: EmailRegisterDto,
  ): Promise<JwtTokenDto> {
    return await this.authService.registerEmail(registerDto);
  }

  @ApiOperation({ summary: '토큰 재발급' })
  @ApiResponse({
    status: 201,
    description: '토큰 재발급 성공',
    type: JwtTokenDto,
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description:
      '여기도 다른 헤더와 같이 Authorization: Bearer 이지만 accessToken이 아니라 refreshToken을 넣어주셔야 합니다',
  })
  @Patch('refresh')
  @UseGuards(RefreshGuard)
  async refresh(
    @CurrentUser() id: string,
    @Req() req: Request,
  ): Promise<JwtTokenDto> {
    const refreshToken = req.headers.authorization!.split(' ')[1];
    return await this.authService.refresh(id, refreshToken);
  }

  @Get('test')
  @UseGuards(JwtGuard)
  async test() {
    return 'test';
  }
}
