import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PipesModule } from './common/pipes/pipes.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SongModule } from './modules/song.module';
import { GlobalFilter } from './common/filter/global.filter';
import { APP_FILTER } from '@nestjs/core';
import { AdminModule } from './modules/admin.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      cache: true,
    }),
    PipesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      global: true,
    }),
    AuthModule,
    UserModule,
    SongModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalFilter,
    },
  ],
})
export class AppModule {}
