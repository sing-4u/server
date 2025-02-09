import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';

describe('DELETE /users/me/image - 프로필 이미지 삭제', () => {
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
    const { status } = await request(app.getHttpServer()).delete(
      '/users/me/image',
    );

    // then
    expect(status).toBe(401);
  });

  it('204와 함께 프로필 이미지를 삭제한다', async () => {
    // given
    const accessToken = await register(app, {});

    const user = await prisma.user.findFirstOrThrow();
    await prisma.user.update({
      where: { id: user.id },
      data: { image: 'profile-image.jpg' },
    });

    // when
    const { status } = await request(app.getHttpServer())
      .delete('/users/me/image')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(204);
    const updatedUser = await prisma.user.findFirstOrThrow();
    expect(updatedUser.image).toBeNull();
  });
});
