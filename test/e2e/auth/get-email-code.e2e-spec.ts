import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

describe('POST /auth/get-email-code - 이메일 코드 발급', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);

    await app.init();
  });

  afterEach(async () => {
    await prisma.emailCode.deleteMany();
    await prisma.user.deleteMany();
  });

  it('이메일이 유효하지 않은 경우 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/get-email-code')
      .send({ email: 'invalidEmail' });

    // then
    expect(status).toBe(400);
  });

  it('해당 이메일로 가입한 유저가 없는 경우 404를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/get-email-code')
      .send({ email: 'test@test.com' });

    // then
    expect(status).toBe(404);
  });

  it('소셜 로그인 유저가 요청한 경우 403을 반환한다', async () => {
    // given
    await prisma.user.create({
      data: {
        provider: 'GOOGLE',
        providerId: '1234',
        email: 'test@test.com',
        name: 'test',
      },
    });

    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/get-email-code')
      .send({ email: 'test@test.com' });

    // then
    expect(status).toBe(403);
  });

  it('이메일 코드를 발급한다', async () => {
    // given
    jest.spyOn(authService, 'sendEmailCode').mockImplementation();
    await prisma.user.create({
      data: {
        provider: 'EMAIL',
        email: 'test@test.com',
        name: 'test',
      },
    });

    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/get-email-code')
      .send({ email: 'test@test.com' });

    // then
    expect(status).toBe(200);
    const emailCode = await prisma.emailCode.findFirst();
    expect(emailCode).toBeDefined();
  });
});
