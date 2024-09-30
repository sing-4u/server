import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PATCH /refresh - 토큰 재발급', () => {
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

  it('refreshToken이 없는 경우 401을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .patch('/auth/refresh')
      .send();

    // then
    expect(status).toBe(401);
  });

  it('refreshToken이 유효하지 않은 경우 401을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .patch('/auth/refresh')
      .set('Authorization', 'Bearer invalidToken');

    // then
    expect(status).toBe(401);
  });

  it('refreshToken이 유효한 경우 200과 함께 새로운 accT, refT를 반환한다', async () => {
    // given
    const { body } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234!',
        name: 'test',
      });

    // when
    const { status: status2, body: body2 } = await request(app.getHttpServer())
      .patch('/auth/refresh')
      .set('Authorization', `Bearer ${body.refreshToken}`);

    // then
    expect(status2).toBe(200);
    expect(body2.accessToken).toBeDefined();
    expect(body2.refreshToken).toBeDefined();
  });
});
