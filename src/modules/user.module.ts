import { Module } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { UserController } from 'src/controllers/user.controller';
import { UserService } from 'src/providers/user.service';
import { MulterModule } from '@nestjs/platform-express';
import { AwsModule } from './aws.module';

@Module({
  imports: [
    MulterModule.register({
      fileFilter: (req, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        cb(null, true);
      },
      limits: {
        fieldSize: 10 * 1024 * 1024,
      },
    }),
    AwsModule,
  ],
  controllers: [UserController],
  providers: [UserRepository, UserService],
  exports: [UserRepository],
})
export class UserModule {}
