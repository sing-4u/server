import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';
import * as argon2 from 'argon2';

describe('PATCH /password - 비밀번호 변경', () => {
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

  it('204와 함께 비밀번호를 변경한다', async () => {
    // given
    const accessToken = await register(app, {});

    // when
    const { status } = await request(app.getHttpServer())
      .patch('/auth/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ newPassword: 'newPassword123!' });

    // then
    expect(status).toBe(204);
    const user = await prisma.user.findFirst();
    const isPasswordValid = await argon2.verify(
      user!.password!,
      'newPassword123!',
    );
    expect(isPasswordValid).toBe(true);
  });
});
