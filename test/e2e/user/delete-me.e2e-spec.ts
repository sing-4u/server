import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';

describe('DELETE /users/me - 회원 탈퇴', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    prisma = module.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('회원 탈퇴한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(204);
    const user = await prisma.user.findFirst();
    expect(user).toBeNull();
  });
});
