import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Req,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import {
  EmailRegisterDto,
  EmailLoginDto,
  SocialLoginDto,
  GetEmailCodeDto,
} from './dto/request';
import { JwtTokenDto } from './dto/response';
import { AuthService } from './auth.service';
import { JwtGuard, RefreshGuard } from './guards';
import { CurrentUser } from 'src/common/decorators';
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
    status: 200,
    description: '토큰 재발급 성공 - accT 뿐만 아니라 refT도 새로 발급합니다',
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

  @ApiOperation({ summary: '이메일 로그인' })
  @ApiBody({ type: EmailLoginDto })
  @ApiResponse({ status: 200, description: '로그인 성공', type: JwtTokenDto })
  @ApiResponse({ status: 404, description: '존재하지 않는 유저' })
  @Post('login/email')
  @HttpCode(200)
  async emailLogin(
    @Body() { email, password }: EmailLoginDto,
  ): Promise<JwtTokenDto> {
    return await this.authService.emailLogin(email, password);
  }

  @ApiOperation({
    summary: '소셜 로그인 (처음 로그인 한거면 회원생성까지 합니다)',
  })
  @ApiBody({ type: SocialLoginDto })
  @ApiResponse({ status: 200, description: '로그인 성공', type: JwtTokenDto })
  @ApiResponse({
    status: 409,
    description:
      '이미 존재하는 이메일 - 해당 소셜 로그인으로 처음 로그인 했을 때 회원생성단계에서 중복된 이메일이 발견된 경우',
  })
  @Post('login/social')
  @HttpCode(200)
  async socialLogin(
    @Body() { provider, providerCode }: SocialLoginDto,
  ): Promise<JwtTokenDto> {
    return await this.authService.socialLogin(provider, providerCode);
  }

  @ApiOperation({ summary: '이메일 코드 전송' })
  @ApiBody({ type: GetEmailCodeDto })
  @ApiResponse({ status: 200, description: '이메일 전송 성공' })
  @ApiResponse({
    status: 403,
    description: '해당 이메일이 있긴있는데 소셜로그인으로 가입한 유저임',
  })
  @ApiResponse({ status: 404, description: '해당 이메일로 가입한 유저가 없음' })
  @Post('get-email-code')
  @HttpCode(200)
  async sendEmailCode(@Body() { email }: GetEmailCodeDto) {
    return await this.authService.sendEmailCode(email);
  }

  @ApiBearerAuth()
  @Get('test')
  @UseGuards(JwtGuard)
  async test() {
    return 'test';
  }
}
