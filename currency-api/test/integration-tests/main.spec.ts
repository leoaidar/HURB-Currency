import { AppModule } from './../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';

describe('ApplicationHURBTest', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: console });
    await app.init();
  });

  it('should successfully perform a health check with all services UP', async () => {
    const expectedResponse = {
      currencyQuoteAPI: 'UP',
      database: 'UP',
      microservice: 'UP',
    };

    await request(app.getHttpServer())
      .get('/HURB/hc')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject(expectedResponse);
      });
  }, 15000);

  afterAll(async () => {
    await app.close();
  });
});
