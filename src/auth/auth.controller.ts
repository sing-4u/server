import { Controller, Post, Body } from '@nestjs/common';
import { EmailRegisterDto } from './dto/request/email-register.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('register/email')
  async registerEmail(@Body() registerDto: EmailRegisterDto) {
    console.log(registerDto);
  }
}
