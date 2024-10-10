import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('POST /auth/verify-email-code - 이메일 코드 검증', () => {
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
    await prisma.emailCode.deleteMany();
    await prisma.user.deleteMany();
  });

  it('코드가 6자리가 아닌 경우 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/verify-email-code')
      .send({ email: 'test@test.com', code: '12345' });

    // then
    expect(status).toBe(400);
  });

  it('해당 이메일에 대한 코드가 없는 경우 401을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/verify-email-code')
      .send({ email: 'test@test.com', code: '123456' });

    // then
    expect(status).toBe(401);
  });

  it('코드가 일치하지 않는 경우 401을 반환한다', async () => {
    // given
    await prisma.user.create({
      data: {
        provider: 'EMAIL',
        email: 'test@test.com',
        name: 'test',
      },
    });

    await prisma.emailCode.create({
      data: {
        email: 'test@test.com',
        code: '123456',
      },
    });

    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/verify-email-code')
      .send({ email: 'test@test.com', code: '654321' });

    // then
    expect(status).toBe(401);
  });

  it('코드가 10분이 지난 경우 401을 반환한다', async () => {
    // given
    await prisma.user.create({
      data: {
        provider: 'EMAIL',
        email: 'test@test.com',
        name: 'test',
      },
    });

    await prisma.emailCode.create({
      data: {
        email: 'test@test.com',
        code: '123456',
        createdAt: new Date(Date.now() - 1000 * 60 * 11),
      },
    });

    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/verify-email-code')
      .send({ email: 'test@test.com', code: '123456' });

    // then
    expect(status).toBe(401);
  });

  it('정상적인 경우 200과 함께 accessToken을 반환한다', async () => {
    // given
    await prisma.user.create({
      data: {
        provider: 'EMAIL',
        email: 'test@test.com',
        name: 'test',
      },
    });

    await prisma.emailCode.create({
      data: {
        email: 'test@test.com',
        code: '123456',
      },
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .post('/auth/verify-email-code')
      .send({ email: 'test@test.com', code: '123456' });

    // then
    expect(status).toBe(200);
    expect(body.accessToken).toBeDefined();
  });
});
