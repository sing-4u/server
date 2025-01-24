import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Get,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { AdminService } from 'src/providers/admin.service';
import { AdminRegisterDto, AdminLoginDto, AdminUpdateDto } from './dto/admin';
import { SuperAdminGuard, NormalAdminGuard } from 'src/common/guards';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(SuperAdminGuard)
  @Post('register')
  async register(@Body() registerDto: AdminRegisterDto) {
    return await this.adminService.register(registerDto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() { id, password }: AdminLoginDto) {
    return await this.adminService.login(id, password);
  }

  @UseGuards(NormalAdminGuard)
  @Get('admins')
  async getAdmins() {
    return await this.adminService.getAdmins();
  }

  @UseGuards(SuperAdminGuard)
  @HttpCode(204)
  @Delete('admins/:id')
  async deleteAdmin(@Param('id') id: string) {
    return await this.adminService.deleteAdmin(id);
  }

  @UseGuards(SuperAdminGuard)
  @HttpCode(204)
  @Put('admins/:id')
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateDto: AdminUpdateDto,
  ) {
    return await this.adminService.updateAdmin(id, updateDto);
  }
}
