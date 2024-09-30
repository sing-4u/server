import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('POST /register/email - 이메일 회원가입', () => {
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

  it('이메일 양식이 아닌 경우 400 에러를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test',
        password: 'test',
        name: 'test',
      });

    //then
    expect(status).toBe(400);
  });

  it('비밀번호가 8자리 미만인 경우 400 에러를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 't1@',
        name: 'test',
      });

    //then
    expect(status).toBe(400);
  });

  it('비밀번호가 16자리 초과인 경우 400 에러를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg12345678!@#$%%^&',
        name: 'test',
      });

    //then
    expect(status).toBe(400);
  });

  it('비밀번호에 숫자가 없는 경우 400 에러를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefdsfg!!',
        name: 'test',
      });

    //then
    expect(status).toBe(400);
  });

  it('비밀번호에 특수문자가 없는 경우 400 에러를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234',
        name: 'test',
      });

    //then
    expect(status).toBe(400);
  });

  it('이름이 1자리 미만인 경우 400 에러를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234!',
        name: '',
      });

    //then
    expect(status).toBe(400);
  });

  it('이메일과 비밀번호가 올바른 경우 201 상태코드를 반환하며 유저를 생성한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234!',
        name: 'test',
      });

    //then
    expect(status).toBe(201);
    const user = await prisma.user.findFirst();
    expect(user!.email).toBe('test@test.com');
  });

  it('이메일이 중복된 경우 409 에러를 반환한다', async () => {
    // given
    await request(app.getHttpServer()).post('/auth/register/email').send({
      email: 'test@test.com',
      password: 'abcdefg1234!',
      name: 'test',
    });

    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234!',
        name: 'test',
      });

    //then
    expect(status).toBe(409);
  });

  it('비밀번호는 해싱되어 저장되어야 한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234!',
        name: 'test',
      });

    //then
    expect(status).toBe(201);
    const user = await prisma.user.findFirst();
    expect(user!.password).not.toBe('abcdefg1234!');
  });

  it('회원가입 성공 시 accessToken과 refreshToken을 반환한다', async () => {
    // when
    const { status, body } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234!',
        name: 'test',
      });

    //then
    expect(status).toBe(201);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    const user = await prisma.user.findFirst();
    expect(user!.refreshToken).toBe(body.refreshToken);

    const { status: status2 } = await request(app.getHttpServer())
      .get('/auth/test')
      .set('Authorization', `Bearer ${body.accessToken}`);
    expect(status2).toBe(200);
  });
});
