import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';

describe('GET /users/me - 내 정보 조회', () => {
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

  it('200과 함께 내 정보를 반환한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status, body } = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(200);
    expect(body).toEqual({
      id: expect.any(String),
      email: expect.any(String),
      name: expect.any(String),
      image: null,
      status: 'CLOSED',
      provider: 'EMAIL',
    });
  });

  it('이미지가 있는 경우 이미지 링크를 반환한다', async () => {
    // given
    const accessToken = await register(app, {});
    const user = await prisma.user.findFirst();
    await prisma.user.update({
      where: { id: user!.id },
      data: { image: 'image.png' },
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(200);
    expect(body).toEqual({
      id: expect.any(String),
      email: expect.any(String),
      name: expect.any(String),
      image: expect.stringContaining('image.png'),
      status: 'CLOSED',
      provider: 'EMAIL',
    });
  });
});
