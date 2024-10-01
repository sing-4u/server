import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const register = async (
  app: INestApplication,
  { email = 'test@test.com', password = 'password123!', name = 'test' },
) => {
  const { body } = await request(app.getHttpServer())
    .post('/auth/register/email')
    .send({ email, password, name });

  return body.accessToken as string;
};
