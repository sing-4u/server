import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';
import { AuthService } from 'src/auth/auth.service';

describe('PATCH /users/me/email - 이메일 변경', () => {
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

  it('이메일 형식이 아닌 경우 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/email')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'invalid' });

    // then
    expect(status).toBe(400);
  });

  it('비밀번호가 일치하지 않는 경우 401을 반환한다', async () => {
    // given
    const accessToken = await register(app, { password: 'password123!' });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/email')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'test@test.com', password: 'invalid' });

    // then
    expect(status).toBe(401);
  });

  it('이미 사용중인 이메일인 경우 409를 반환한다', async () => {
    // given
    await register(app, {
      email: 'test@test.com',
    });

    const accessToken = await register(app, {
      email: 'test2@test.com',
      password: 'password123!',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/email')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'test@test.com', password: 'password123!' });

    // then
    expect(status).toBe(409);
  });

  it('204와 함께 이메일을 정상적으로 변경한다', async () => {
    // given
    const accessToken = await register(app, {
      email: 'test@test.com',
      password: 'password123!',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/email')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'test2@test.com', password: 'password123!' });

    // then
    expect(status).toBe(204);
    const user = await prisma.user.findFirst();
    expect(user?.email).toBe('test2@test.com');
  });

  it('소셜 로그인 사용자는 password 없이 이메일을 변경한다', async () => {
    // given
    jest
      .spyOn(authService, 'getGoogleAccessToken')
      .mockResolvedValue('testAccessToken');
    jest.spyOn(authService, 'getGoogleProfile').mockResolvedValue({
      email: 'test@test.com',
      id: 'testId',
      verified_email: true,
      picture: 'testPicture',
    });
    const { body } = await request(app.getHttpServer())
      .post('/auth/login/social')
      .send({
        provider: 'GOOGLE',
        providerCode: 'testCode',
      });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/email')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ email: 'test2@test.com' });

    // then
    expect(status).toBe(204);
  });
});
