import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';

describe('PUT /users/me - 내 정보 수정', () => {
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

  it('accessToken이 없으면 401을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer()).put('/users/me');

    // then
    expect(status).toBe(401);
  });

  it('name이 없으면 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        bio: '바이오',
        cover: 'https://www.cover.com',
        links: [],
      });

    // then
    expect(status).toBe(400);
  });

  it('name이 20자를 초과하면 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'a'.repeat(21),
        bio: '바이오',
        cover: 'https://www.cover.com',
        links: [],
      });

    // then
    expect(status).toBe(400);
  });

  it('bio가 80자를 초과하면 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: '이름',
        bio: 'a'.repeat(81),
        cover: 'https://www.cover.com',
        links: [],
      });

    // then
    expect(status).toBe(400);
  });

  it('cover가 url 형식이 아니면 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: '이름',
        bio: '바이오',
        cover: 'cover',
        links: [],
      });

    // then
    expect(status).toBe(400);
  });

  it('links가 url 형식이 아니면 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status, body } = await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: '이름',
        bio: '바이오',
        cover: 'https://www.cover.com',
        links: [
          {
            linkName: '인스타그램',
            url: 'instagram',
          },
        ],
      });
    console.log(body);

    // then
    expect(status).toBe(400);
  });
});
