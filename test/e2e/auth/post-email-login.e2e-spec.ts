import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('POST /login/email - 이메일 로그인', () => {
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

  it('존재하지 않는 유저인 경우 404 에러를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/login/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234!',
      });

    // then
    expect(status).toBe(404);
  });

  it('비밀번호가 일치하지 않는 경우 401 에러를 반환한다', async () => {
    // given
    await request(app.getHttpServer()).post('/auth/register/email').send({
      email: 'test@test.com',
      password: 'abcdefg1234!',
      name: 'test',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/login/email')
      .send({
        email: 'test@test.com',
        password: 'wrongPassword',
      });

    // then
    expect(status).toBe(401);
  });

  it('로그인 성공 시 200과 함께 토큰을 반환한다', async () => {
    // given
    await request(app.getHttpServer()).post('/auth/register/email').send({
      email: 'test@test.com',
      password: 'abcdefg1234!',
      name: 'test',
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .post('/auth/login/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234!',
      });

    // then
    expect(status).toBe(200);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });
});
