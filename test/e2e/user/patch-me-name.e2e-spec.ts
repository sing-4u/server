import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';

describe('PATCH /users/me/name - 이름 변경', () => {
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

  it('이름이 없는 경우 400 에러를 반환한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/name')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    // then
    expect(status).toBe(400);
  });

  it('204와 함께 이름을 변경한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/users/me/name')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'newName' });

    // then
    expect(status).toBe(204);
    const user = await prisma.user.findFirst({ where: { name: 'newName' } });
    expect(user).not.toBeNull();
  });
});
