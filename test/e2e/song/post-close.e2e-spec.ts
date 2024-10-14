import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';

describe('POST /songs/close - 신청곡 닫기', () => {
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

  it('신청곡 id가 없으면 400을 반환한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .post('/songs/close')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(400);
  });

  it('신청곡을 닫고 204를 반환한다', async () => {
    // given
    const accessToken = await register(app, {});
    const user = await prisma.user.findFirst();
    const [songList] = await Promise.all([
      prisma.songList.create({ data: { userId: user!.id } }),
      prisma.user.update({
        where: { id: user!.id },
        data: { status: 'OPENED' },
      }),
    ]);

    // when
    const { status } = await request(app.getHttpServer())
      .post('/songs/close')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ songListId: songList.id });

    // then
    expect(status).toBe(204);
    const [updatedUser, updatedSongList] = await Promise.all([
      prisma.user.findFirst(),
      prisma.songList.findFirst(),
    ]);
    expect(updatedUser!.status).toBe('CLOSED');
    expect(updatedSongList!.endDate).not.toBeNull();
  });
});