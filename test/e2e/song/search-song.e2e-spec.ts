import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('GET /songs/search - 노래 검색', () => {
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

  it('query가 없으면 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer()).get('/songs/search');

    // then
    expect(status).toBe(400);
  });

  it('query가 공백이어도 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer()).get(
      '/songs/search?query=  ',
    );

    // then
    expect(status).toBe(400);
  });

  it('200과 함께 노래를 검색한다', async () => {
    // when
    const { status, body } = await request(app.getHttpServer()).get(
      '/songs/search?query=드라우닝',
    );

    // then
    expect(status).toBe(200);
    expect(body).toEqual([
      {
        artist: 'WOODZ',
        title: 'Drowning',
        image:
          'https://i.scdn.co/image/ab67616d0000b273e87a41550ee1b24be3e6e1fb',
      },
      {
        artist: 'Marcus Way',
        title: 'Stilldrowning',
        image:
          'https://i.scdn.co/image/ab67616d0000b2734c4d9b3a6d1e9ab6682db307',
      },
      {
        artist: 'WOODZ',
        title: 'SUN OR SUCK',
        image:
          'https://i.scdn.co/image/ab67616d0000b273ac973877ffb9fd1e2e6774e2',
      },
      {
        artist: 'DAY6',
        title: 'Love me or Leave me',
        image:
          'https://i.scdn.co/image/ab67616d0000b2736b2b448f14b021b049cdceb1',
      },
      {
        artist: 'WOODZ',
        title: 'AMNESIA',
        image:
          'https://i.scdn.co/image/ab67616d0000b273e8d2763d7a51f922b367ca3c',
      },
    ]);
  });
});
