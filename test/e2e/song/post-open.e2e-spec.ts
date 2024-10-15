import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';

describe('POST /songs/open - 신청곡 열기', () => {
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

  it('신청곡이 이미 열려있는 경우 409를 반환한다', async () => {
    // given
    const accessToken = await register(app, {});
    await prisma.user.updateMany({
      data: { isOpened: true },
    });

    // when
    const { status } = await request(app.getHttpServer())
      .post('/songs/open')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(409);
  });

  it('신청곡이 열리고 204를 반환한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .post('/songs/open')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(204);
    const [user, songList] = await Promise.all([
      prisma.user.findFirst(),
      prisma.songList.findFirst(),
    ]);
    expect(user!.isOpened).toBe(true);
    expect(songList).not.toBeNull();
  });
});
