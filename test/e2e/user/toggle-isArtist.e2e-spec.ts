import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';

describe('PATCH /users/me/toggle-artist - 아티스트 전환', () => {
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
    const { status } = await request(app.getHttpServer()).patch(
      '/users/me/toggle-artist',
    );

    // then
    expect(status).toBe(401);
  });

  it('204와 함께 false에서 true로 변경한다', async () => {
    // given
    const accessToken = await register(app, { isArtist: false });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/toggle-artist')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(204);
    const user = await prisma.user.findFirstOrThrow();
    expect(user.isArtist).toBe(true);
  });

  it('204와 함께 true에서 false로 변경한다', async () => {
    // given
    const accessToken = await register(app, { isArtist: true });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/toggle-artist')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(204);
    const user = await prisma.user.findFirstOrThrow();
    expect(user.isArtist).toBe(false);
  });

  it('아티스트가 신청곡을 받고 있는 상태일 때 신청곡을 닫고 false로 변경한다', async () => {
    // given
    const accessToken = await register(app, { isArtist: true });
    const user = await prisma.user.findFirstOrThrow();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOpened: true,
      },
    });
    await prisma.songList.create({
      data: {
        userId: user.id,
      },
    });

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/toggle-artist')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(204);
    const updatedUser = await prisma.user.findFirstOrThrow();
    expect(updatedUser.isArtist).toBe(false);
    const songList = await prisma.songList.findFirst();
    expect(songList).toBeNull();
  });
});
