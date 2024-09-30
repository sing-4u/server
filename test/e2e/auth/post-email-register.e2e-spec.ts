import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('POST /register/email - 이메일 회원가입', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('이메일 양식이 아닌 경우 400 에러를 반환한다', async () => {
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test',
        password: 'test',
        name: 'test',
      });

    expect(status).toBe(400);
  });

  it('비밀번호가 8자리 미만인 경우 400 에러를 반환한다', async () => {
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 't1@',
        name: 'test',
      });

    expect(status).toBe(400);
  });

  it('비밀번호가 16자리 초과인 경우 400 에러를 반환한다', async () => {
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg12345678!@#$%%^&',
        name: 'test',
      });

    expect(status).toBe(400);
  });

  it('비밀번호에 숫자가 없는 경우 400 에러를 반환한다', async () => {
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefdsfg!!',
        name: 'test',
      });

    expect(status).toBe(400);
  });

  it('비밀번호에 특수문자가 없는 경우 400 에러를 반환한다', async () => {
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234',
        name: 'test',
      });

    expect(status).toBe(400);
  });

  it('이름이 1자리 미만인 경우 400 에러를 반환한다', async () => {
    const { status, body } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234!',
        name: '',
      });

    expect(status).toBe(400);
    console.log(body);
  });

  it('이메일과 비밀번호가 올바른 경우 201 상태코드를 반환한다', async () => {
    const { status } = await request(app.getHttpServer())
      .post('/auth/register/email')
      .send({
        email: 'test@test.com',
        password: 'abcdefg1234!',
        name: 'test',
      });

    expect(status).toBe(201);
  });
});
