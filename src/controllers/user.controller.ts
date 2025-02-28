import {
  Controller,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  Get,
  Delete,
  Query,
  Param,
  ParseUUIDPipe,
  HttpException,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from 'src/providers/user.service';
import {
  UpdateUserNameDto,
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdateImageDto,
  GetUserListDto,
  UpdateProfileDto,
} from './dto/user/request';
import {
  ImageDto,
  UserProfileDto,
  GetUsersResponseDto,
  GetUserResponseDto,
} from './dto/user/response';
import { CurrentUser } from 'src/common/decorators';

@ApiTags('users')
@ApiResponse({ status: 400, description: '유효성 검사 실패' })
@ApiResponse({ status: 401, description: '인증 실패' })
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: '내 정보 조회' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '성공', type: UserProfileDto })
  @Get('me')
  @UseGuards(JwtGuard)
  async getMe(@CurrentUser() userId: string): Promise<UserProfileDto> {
    return await this.userService.getMyInfo(userId);
  }

  @ApiOperation({ summary: '내 정보 수정' })
  @ApiBearerAuth()
  @Put('me')
  @UseGuards(JwtGuard)
  async updateMe(@CurrentUser() userId: string, @Body() dto: UpdateProfileDto) {
    console.log(dto);
  }

  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: '성공' })
  @Delete('me')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async deleteUser(@CurrentUser() userId: string) {
    await this.userService.deleteUser(userId);
  }

  @ApiOperation({ summary: '이름 변경' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserNameDto })
  @ApiResponse({ status: 204, description: '성공' })
  @Patch('me/name')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async updateName(
    @CurrentUser() userId: string,
    @Body() { name }: UpdateUserNameDto,
  ) {
    await this.userService.updateName(userId, name);
  }

  @ApiOperation({ summary: '이메일 변경' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateEmailDto })
  @ApiResponse({ status: 204, description: '성공' })
  @ApiResponse({ status: 401, description: '비밀번호가 틀림' })
  @ApiResponse({ status: 409, description: '이미 사용중인 이메일' })
  @Patch('me/email')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async updateEmail(
    @CurrentUser() userId: string,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    await this.userService.updateEmail(userId, updateEmailDto);
  }

  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 204, description: '성공' })
  @ApiResponse({ status: 401, description: '비밀번호가 틀림' })
  @Patch('me/password')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async updatePassword(
    @CurrentUser() userId: string,
    @Body() { oldPassword, newPassword }: UpdatePasswordDto,
  ) {
    await this.userService.updatePassword(userId, { oldPassword, newPassword });
  }

  @ApiOperation({
    summary: '프로필 이미지 업로드',
    description: '이미지 파일은 multipart/formdata 형식',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateImageDto })
  @ApiResponse({ status: 201, description: '성공', type: ImageDto })
  @Patch('me/image')
  @UseGuards(JwtGuard)
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @CurrentUser() userId: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ImageDto> {
    if (!image) {
      throw new HttpException('이미지 파일이 필요합니다', 400);
    }
    return await this.userService.updateProfileImage(userId, image);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '프로필 이미지 삭제' })
  @ApiResponse({ status: 204, description: '성공' })
  @UseGuards(JwtGuard)
  @Delete('me/image')
  @HttpCode(204)
  async deleteProfileImage(@CurrentUser() userId: string) {
    await this.userService.deleteProfileImage(userId);
    return;
  }

  @ApiOperation({ summary: 'isArtist toggle' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: '성공' })
  @Patch('me/toggle-artist')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async toggleIsArtist(@CurrentUser() userId: string) {
    await this.userService.toggleIsArtist(userId);
    return;
  }

  @ApiOperation({ summary: '유저 리스트 조회' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({
    name: 'index',
    required: true,
    type: Number,
    description: '0부터 시작입니다',
  })
  @ApiQuery({ name: 'size', required: true, type: Number })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: GetUsersResponseDto,
    isArray: true,
  })
  @Get()
  async getUsers(
    @Query() query: GetUserListDto,
  ): Promise<GetUsersResponseDto[]> {
    if (query.name) {
      return await this.userService.getAllByName({
        index: query.index,
        size: query.size,
        name: query.name,
      });
    } else {
      return await this.userService.getAll(query);
    }
  }

  @ApiOperation({ summary: '유저 조회' })
  @ApiParam({ name: 'userId', required: true })
  @ApiResponse({ status: 200, description: '성공', type: GetUserResponseDto })
  @ApiResponse({ status: 404, description: '유저 없음' })
  @Get(':userId')
  async getUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<GetUserResponseDto> {
    return await this.userService.getOne(userId);
  }
}
