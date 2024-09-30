import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { EmailRegisterDto } from './dto/request';
import { JwtTokenDto } from './dto/request/response';
import { AuthService } from './auth.service';

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
}
