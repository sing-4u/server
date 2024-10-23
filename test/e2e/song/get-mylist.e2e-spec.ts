import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';

describe('GET /songs/mylist - 내 신청곡 목록', () => {
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

  it('내 신청곡 목록을 반환한다', async () => {
    // given
    const accessToken = await register(app, {});
    const user = await prisma.user.findFirstOrThrow();
    const [songList1, songList2] = await Promise.all([
      prisma.songList.create({
        data: {
          userId: user.id,
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endDate: new Date(),
        },
      }),
      prisma.songList.create({
        data: {
          userId: user.id,
          startDate: new Date(),
        },
      }),
    ]);

    await prisma.song.createMany({
      data: [
        {
          songListId: songList1.id,
          artist: '아이유',
          title: '밤편지',
          email: 'test@test.com',
        },
        {
          songListId: songList1.id,
          artist: '박화요비',
          title: '그런일은',
          email: 'test@test.com',
        },
        {
          songListId: songList1.id,
          artist: '아이유',
          title: '좋은날',
          email: 'test@test.com',
        },
        {
          songListId: songList1.id,
          artist: '아이유',
          title: '좋은날',
          email: 'test2@test.com',
        },
      ],
    });

    // when
    const { status, body } = await request(app.getHttpServer())
      .get('/songs/mylist')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(200);
    expect(body).toEqual([
      {
        id: songList2.id,
        startDate: songList2.startDate.toISOString(),
        endDate: null,
      },
      {
        id: songList1.id,
        startDate: songList1.startDate.toISOString(),
        endDate: expect.any(String),
      },
    ]);
  });
});
