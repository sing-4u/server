import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('GET /users/:userId - 유저 정보 받기', () => {
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

  it('userId가 uuid 형식이 아니면 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer()).get('/users/1');

    // then
    expect(status).toBe(400);
  });

  it('userId에 해당하는 사용자가 없으면 404를 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer()).get(
      '/users/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4b1b',
    );

    // then
    expect(status).toBe(404);
  });

  it('200과 함께 사용자 정보를 반환한다', async () => {
    // given
    const user = await prisma.user.create({
      data: {
        provider: 'EMAIL',
        email: 'test@test.com',
        name: '테스트 사용자',
        isOpened: true,
      },
    });

    // when
    const { status, body } = await request(app.getHttpServer()).get(
      `/users/${user.id}`,
    );

    // then
    expect(status).toBe(200);
    expect(body).toEqual({
      id: user.id,
      image: null,
      email: 'test@test.com',
      name: '테스트 사용자',
      isOpened: true,
    });
  });
});
