import {
  Controller,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from 'src/providers/user.service';
import {
  UpdateUserNameDto,
  UpdateEmailDto,
  UpdatePasswordDto,
} from './dto/user/request';
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
  @Patch('me/name')
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
  @ApiResponse({ status: 401, description: '비밀번호가 틀림' })
  @ApiResponse({ status: 409, description: '이미 사용중인 이메일' })
  @Patch('me/email')
  @HttpCode(204)
  async updateEmail(
    @CurrentUser() userId: string,
    @Body() { email, password }: UpdateEmailDto,
  ) {
    await this.userService.updateEmail(userId, { email, password });
  }

  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 204, description: '성공' })
  @ApiResponse({ status: 401, description: '비밀번호가 틀림' })
  @Patch('me/password')
  @HttpCode(204)
  async updatePassword(
    @CurrentUser() userId: string,
    @Body() { oldPassword, newPassword }: UpdatePasswordDto,
  ) {
    await this.userService.updatePassword(userId, { oldPassword, newPassword });
  }

  @ApiOperation({
    summary: '프로필 이미지 변경',
    description:
      '이미지 파일은 multipart/formdata 형식이며 이미지 파일이 없거나 null인 경우 이미지 삭제로 간주합니다',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '성공' })
  @Patch('me/image')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @CurrentUser() userId: string,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return await this.userService.updateProfileImage(userId, image);
  }
}
