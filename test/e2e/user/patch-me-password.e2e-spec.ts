import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';
import * as argon2 from 'argon2';

describe('PATCH /users/me/password - 비밀번호 변경', () => {
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

  it('비밀번호가 8자리 미만인 경우 400을 반화한다', async () => {
    // given
    const accessToken = await register(app, {
      password: 'password123!',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: 'password123!', newPassword: 'a1!' });

    // then
    expect(status).toBe(400);
  });

  it('비밀번호가 16자리 초과인 경우 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {
      password: 'password123!',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: 'password123!',
        newPassword: 'a'.repeat(17) + '1!',
      });

    // then
    expect(status).toBe(400);
  });

  it('비밃번호에 숫자가 없는경우 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {
      password: 'password123!',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: 'password123!',
        newPassword: 'password!',
      });

    // then
    expect(status).toBe(400);
  });

  it('비밀번호에 특수문자가 없는 경우 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {
      password: 'password123!',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: 'password123!',
        newPassword: 'password1',
      });

    // then
    expect(status).toBe(400);
  });

  it('비밀번호에 영문자가 없는 경우 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {
      password: 'password123!',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: 'password123!',
        newPassword: '12345678!',
      });

    // then
    expect(status).toBe(400);
  });

  it('비밀번호가 일치하지 않는 경우 401을 반환한다', async () => {
    // given
    const accessToken = await register(app, {
      password: 'password123!',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: 'different',
        newPassword: 'password1234!',
      });

    // then
    expect(status).toBe(401);
  });

  it('204와 함께 비밀번호를 변경한다', async () => {
    // given
    const accessToken = await register(app, {
      password: 'password123!',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: 'password123!',
        newPassword: 'password1234!',
      });

    // then
    expect(status).toBe(204);
    const user = await prisma.user.findFirst();

    const isValidPassword = await argon2.verify(
      user!.password!,
      'password1234!',
    );
    expect(isValidPassword).toBe(true);
    const isValidOldPassword = await argon2.verify(
      user!.password!,
      'password123!',
    );
    expect(isValidOldPassword).toBe(false);
  });
});
