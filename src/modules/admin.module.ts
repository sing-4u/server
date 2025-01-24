import { Module } from '@nestjs/common';
import { AdminController } from 'src/controllers/admin.controller';
import { AdminService } from 'src/providers/admin.service';
import { AdminRepository } from 'src/repositories/admin.repository';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
  exports: [AdminRepository],
})
export class AdminModule {}
