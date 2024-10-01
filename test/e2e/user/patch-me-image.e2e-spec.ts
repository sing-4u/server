import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { register } from '../helpers';
import * as fs from 'fs';
import * as path from 'path';
import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

describe('PATCH /users/me/image - 프로필 이미지 변경', () => {
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

  it('프로필 이미지를 변경한다', async () => {
    // given
    const accessToken = await register(app, {});
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');

    // when
    const { status, body } = await request(app.getHttpServer())
      .patch('/users/me/image')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath);

    // then
    expect(status).toBe(201);
    expect(body.image).not.toBeNull();
    const s3Client = new S3Client({});
    const response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `users/${body.image.split('/').pop()}`,
      }),
    );
    expect(response.$metadata.httpStatusCode).toEqual(200);

    // cleanup
    fs.unlinkSync(filePath);
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `users/${body.image.split('/').pop()}`,
      }),
    );
  });

  it('프로필 이미지를 삭제한다', async () => {
    // given
    const accessToken = await register(app, {});
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');
    const { body } = await request(app.getHttpServer())
      .patch('/users/me/image')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath);

    // when
    const { status, body: body2 } = await request(app.getHttpServer())
      .patch('/users/me/image')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(status).toBe(201);
    expect(body2.image).toBeNull();
    const s3Client = new S3Client({});
    expect(async () => {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `users/${body.image.split('/').pop()}`,
        }),
      );
    }).rejects.toThrow();
    const user = await prisma.user.findFirst();
    expect(user!.image).toBeNull();
  });

  it('이미지 파일이 기존에 있을 때, 새로운 이미지 파일로 변경한다', async () => {
    // given
    const accessToken = await register(app, {});
    const filePath = path.join(__dirname, 'test.png');
    fs.writeFileSync(filePath, 'test-png');
    const { body } = await request(app.getHttpServer())
      .patch('/users/me/image')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath);

    // when
    const { status, body: body2 } = await request(app.getHttpServer())
      .patch('/users/me/image')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', filePath);

    // then
    expect(status).toBe(201);
    expect(body2.image).not.toBeNull();
    const s3Client = new S3Client({});
    const response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `users/${body2.image.split('/').pop()}`,
      }),
    );
    expect(async () => {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `users/${body.image.split('/').pop()}`,
        }),
      );
    }).rejects.toThrow();
    expect(response.$metadata.httpStatusCode).toEqual(200);
    expect(body2.image).not.toEqual(body.image);

    // cleanup
    fs.unlinkSync(filePath);
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `users/${body2.image.split('/').pop()}`,
      }),
    );
  });
});
