import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('POST /songs - 곡 신청', () => {
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

  it('userId가 없으면 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer())
      .post('/songs')
      .send({ email: 'test@test.com', artist: '아티스트', title: '제목' });

    // then
    expect(status).toBe(400);
  });

  it('email이 없으면 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer()).post('/songs').send({
      userId: '08859fdb-18d8-49fa-836a-2c0c0e99f03f',
      artist: '아티스트',
      title: '제목',
    });

    // then
    expect(status).toBe(400);
  });

  it('artist가 없으면 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer()).post('/songs').send({
      userId: '08859fdb-18d8-49fa-836a-2c0c0e99f03f',
      email: 'test@test.com',
      title: '제목',
    });

    // then
    expect(status).toBe(400);
  });

  it('title이 없으면 400을 반환한다', async () => {
    // when
    const { status } = await request(app.getHttpServer()).post('/songs').send({
      userId: '08859fdb-18d8-49fa-836a-2c0c0e99f03f',
      email: 'test@test.com',
      artist: '아티스트',
    });

    // then
    expect(status).toBe(400);
  });

  it('신청을 받은 유저가 열어놓은 songList가 없다면 404를 반환한다', async () => {
    // given
    const user = await prisma.user.create({
      data: {
        provider: 'EMAIL',
        email: 'test@test.com',
        name: 'testUser',
        status: 'CLOSED',
      },
    });

    // when
    const { status } = await request(app.getHttpServer()).post('/songs').send({
      userId: user.id,
      email: 'test2@test.com',
      artist: '아티스트',
      title: '제목',
    });

    // then
    expect(status).toBe(404);
  });

  it('201과 함께 정상적으로 곡이 신청된다', async () => {
    // given
    const user = await prisma.user.create({
      data: {
        provider: 'EMAIL',
        email: 'test@test.com',
        name: 'testUser',
        status: 'OPENED',
      },
    });

    await prisma.songList.create({
      data: {
        userId: user.id,
      },
    });

    // when
    const { status } = await request(app.getHttpServer()).post('/songs').send({
      userId: user.id,
      email: 'test2@test.com',
      artist: '아티스트',
      title: '제목',
    });

    // then
    expect(status).toBe(201);
    const song = await prisma.song.findFirst();
    expect(song).not.toBeNull();
  });

  it('동일한 이메일, 아티스트, 제목으로 신청한 곡이 있다면 409를 반환한다', async () => {
    // given
    const user = await prisma.user.create({
      data: {
        provider: 'EMAIL',
        email: 'test@test.com',
        name: 'testUser',
        status: 'OPENED',
      },
    });

    const songList = await prisma.songList.create({
      data: {
        userId: user.id,
      },
    });

    await prisma.song.create({
      data: {
        songListId: songList.id,
        email: 'example@example.com',
        artist: '아티스트',
        title: '제목',
      },
    });

    // when
    const { status } = await request(app.getHttpServer()).post('/songs').send({
      userId: user.id,
      email: 'example@example.com',
      artist: '아티스트',
      title: '제목',
    });

    // then
    expect(status).toBe(409);
  });
});
