import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('GET /users - 사용자 목록 조회', () => {
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

  it('사용자가 없으면 200과 함께 빈 배열을 반환한다', async () => {
    // when
    const { status, body } = await request(app.getHttpServer()).get('/users');

    // then
    expect(status).toBe(200);
    expect(body).toEqual({
      nextCursor: null,
      users: [],
    });
  });

  it('상태가 OPENED인 사용자를 우선으로 정렬하여 반환한다', async () => {
    // given
    await prisma.user.createMany({
      data: [
        {
          provider: 'EMAIL',
          email: 'test@test.com',
          name: 'test1',
          isOpened: false,
          isArtist: true,
        },
        {
          provider: 'EMAIL',
          email: 'test2@test.com',
          name: 'test2',
          isOpened: true,
          isArtist: true,
        },
        {
          provider: 'EMAIL',
          email: 'test3@test.com',
          name: 'test3',
          isOpened: false,
          isArtist: true,
        },
        {
          provider: 'EMAIL',
          email: 'test4@test.com',
          name: 'test4',
          isOpened: true,
          isArtist: true,
        },
      ],
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .get('/users')
      .query({
        size: 10,
      });

    // then
    expect(status).toBe(200);
    expect(body).toEqual({
      nextCursor: null,
      users: [
        {
          id: expect.any(String),
          name: expect.any(String),
          isOpened: true,
          image: null,
        },
        {
          id: expect.any(String),
          name: expect.any(String),
          isOpened: true,
          image: null,
        },
        {
          id: expect.any(String),
          name: expect.any(String),
          isOpened: false,
          image: null,
        },
        {
          id: expect.any(String),
          name: expect.any(String),
          isOpened: false,
          image: null,
        },
      ],
    });
  });

  it('사용자가 많아도 index와 size에 따라 반환한다', async () => {
    // given
    await prisma.user.createMany({
      data: Array.from({ length: 20 }, (_, i) => ({
        provider: 'EMAIL',
        email: `test${i}@test.com`,
        name: `test${i}`,
        isOpened: false,
        isArtist: true,
      })),
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .get('/users')
      .query({
        size: 15,
      });

    const { status: status2, body: body2 } = await request(app.getHttpServer())
      .get('/users')
      .query({
        cursor: body.nextCursor,
        size: 15,
      });

    // then
    expect(status).toBe(200);
    expect(status2).toBe(200);
    expect(body2.users).toHaveLength(5);
  });

  it('이름으로 사용자를 검색하여 반환한다', async () => {
    // given
    await prisma.user.createMany({
      data: [
        {
          provider: 'EMAIL',
          email: 'test@test.com',
          name: 'test1',
          isArtist: true,
        },
        {
          provider: 'EMAIL',
          email: 'test2@test.com',
          name: 'test2',
          isArtist: true,
        },
        {
          provider: 'EMAIL',
          email: 'test3@test.com',
          name: 'example1',
          isArtist: true,
        },
      ],
    });

    // when
    const response1 = await request(app.getHttpServer()).get('/users').query({
      size: 10,
      name: 'test',
    });

    const response2 = await request(app.getHttpServer()).get('/users').query({
      size: 10,
      name: 'exam',
    });

    // then
    expect(response1.status).toBe(200);
    expect(response1.body.users).toHaveLength(2);

    expect(response2.status).toBe(200);
    expect(response2.body.users).toHaveLength(1);
  });

  it('한글 이름도 검색하여 반환한다', async () => {
    // given
    await prisma.user.createMany({
      data: [
        {
          provider: 'EMAIL',
          email: 'test@test.com',
          name: '테스트1계정',
          isArtist: true,
        },
        {
          provider: 'EMAIL',
          email: 'test2@test.com',
          name: '테스트2',
          isArtist: true,
        },
      ],
    });

    // when
    const response = await request(app.getHttpServer()).get('/users').query({
      size: 10,
      name: '스트',
    });

    // then
    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(2);
  });
});
