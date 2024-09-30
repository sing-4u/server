import { Module } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';

@Module({
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
