import { Module } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { UserController } from 'src/controllers/user.controller';
import { UserService } from 'src/providers/user.service';

@Module({
  controllers: [UserController],
  providers: [UserRepository, UserService],
  exports: [UserRepository],
})
export class UserModule {}
