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
    expect(Array.isArray(body)).toBe(true);
  });
});
