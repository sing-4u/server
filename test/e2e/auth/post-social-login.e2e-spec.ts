import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

describe('POST /login/social - 소셜 로그인', () => {
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
    await prisma.user.deleteMany();
  });

  it('허용하지 않는 provider인 경우 400 에러를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/login/social')
      .send({
        provider: 'INVALID',
        providerCode: 'test',
      });

    // then
    expect(status).toBe(400);
  });

  it('providerCode가 없는 경우 400 에러를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/login/social')
      .send({
        provider: 'GOOGLE',
      });

    // then
    expect(status).toBe(400);
  });

  it('없는 회원인 경우 새로운 회원을 생성하고 200과 함께 토큰을 반환한다', async () => {
    // given
    const spy2 = jest.spyOn(authService, 'getGoogleProfile').mockResolvedValue({
      email: 'test@test.com',
      id: 'testId',
      verified_email: true,
      picture: 'testPicture',
    });
    // when
    const { status, body } = await request(app.getHttpServer())
      .post('/auth/login/social')
      .send({
        provider: 'GOOGLE',
        providerAccessToken: 'testToken',
      });

    // then
    expect(status).toBe(200);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();

    // cleanup
    spy2.mockRestore();
  });

  it('이미 가입된 회원인 경우 200과 함께 토큰을 반환한다', async () => {
    // given
    const spy2 = jest.spyOn(authService, 'getGoogleProfile').mockResolvedValue({
      email: 'test@test.com',
      id: 'testId',
      verified_email: true,
      picture: 'testPicture',
    });

    await request(app.getHttpServer()).post('/auth/login/social').send({
      provider: 'GOOGLE',
      providerAccessToken: 'testToken',
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .post('/auth/login/social')
      .send({
        provider: 'GOOGLE',
        providerAccessToken: 'testToken',
      });

    // then
    expect(status).toBe(200);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();

    // cleanup
    spy2.mockRestore();
  });

  it('해당 소셜 로그인으로 가입한 건 아니지만 동일한 이메일이 이미 있는 경우 409 에러를 반환한다', async () => {
    // given
    const spy2 = jest.spyOn(authService, 'getGoogleProfile').mockResolvedValue({
      email: 'test@test.com',
      id: 'testId',
      verified_email: true,
      picture: 'testPicture',
    });

    await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'test',
        provider: 'EMAIL',
      },
    });

    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/login/social')
      .send({
        provider: 'GOOGLE',
        providerAccessToken: 'testToken',
      });

    // then
    expect(status).toBe(409);

    // cleanup
    spy2.mockRestore();
  });
});
