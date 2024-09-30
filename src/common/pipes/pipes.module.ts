import { Module, Provider, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

const pipes: Provider[] = [
  {
    provide: APP_PIPE,
    useValue: new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      enableDebugMessages: true,
    }),
  },
];

@Module({
  providers: [...pipes],
})
export class PipesModule {}
