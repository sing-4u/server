import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('GET /songs/mylist/:songListId - 신청곡 목록 상세 조회', () => {
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

  it('songListId가 UUID가 아닌 경우 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer()).get(
      '/songs/mylist/123',
    );

    // then
    expect(status).toBe(400);
  });

  it('200과 함께 신청곡 목록 상세를 반환한다', async () => {
    // given
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'test',
        provider: 'EMAIL',
      },
    });
    await prisma.user.createMany({
      data: [
        {
          email: 'test2@test.com',
          name: 'test2',
          provider: 'EMAIL',
        },
        {
          email: 'test3@test.com',
          name: 'test3',
          provider: 'EMAIL',
        },
        {
          email: 'test4@test.com',
          name: 'test4',
          provider: 'EMAIL',
        },
      ],
    });
    const songList = await prisma.songList.create({
      data: {
        userId: user.id,
      },
    });
    await prisma.song.createMany({
      data: [
        {
          songListId: songList.id,
          artist: '아이유',
          title: '밤편지',
          email: 'test@test.com',
        },
        {
          songListId: songList.id,
          artist: '박화요비',
          title: '그런일은',
          email: 'test2@test.com',
        },
        {
          songListId: songList.id,
          artist: '아이유',
          title: '좋은날',
          email: 'test3@test.com',
        },
        {
          songListId: songList.id,
          artist: '아이유',
          title: '좋은날',
          email: 'test4@test.com',
        },
      ],
    });

    // when
    const { status, body } = await request(app.getHttpServer()).get(
      `/songs/mylist/${songList.id}`,
    );

    // then
    expect(status).toBe(200);
    expect(body).toHaveLength(3);
    expect(body).toEqual([
      { artist: '아이유', title: '좋은날', count: 2 },
      { artist: '아이유', title: '밤편지', count: 1 },
      { artist: '박화요비', title: '그런일은', count: 1 },
    ]);
  });
});
