import { Controller, Patch, Body, UseGuards, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards';
import { UserService } from 'src/providers/user.service';
import { UpdateUserNameDto, UpdateEmailDto } from './dto/user/request';
import { CurrentUser } from 'src/common/pipes/decorators';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: '이름 변경' })
  @ApiBody({ type: UpdateUserNameDto })
  @ApiResponse({ status: 204, description: '성공' })
  @Patch('name')
  @HttpCode(204)
  async updateName(
    @CurrentUser() userId: string,
    @Body() { name }: UpdateUserNameDto,
  ) {
    await this.userService.updateName(userId, name);
  }

  @ApiOperation({ summary: '이메일 변경' })
  @ApiBody({ type: UpdateEmailDto })
  @ApiResponse({ status: 204, description: '성공' })
  @ApiResponse({ status: 409, description: '이미 사용중인 이메일' })
  @Patch('email')
  @HttpCode(204)
  async updateEmail(
    @CurrentUser() userId: string,
    @Body() { email, password }: UpdateEmailDto,
  ) {
    await this.userService.updateEmail(userId, { email, password });
  }
}
