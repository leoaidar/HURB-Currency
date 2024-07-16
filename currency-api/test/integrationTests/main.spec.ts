import { AppModule } from './../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';

describe('ApplicationHURBTest', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    await app.init();
  });

  it('should successfully perform a health check with all services UP', async () => {
    await request(app.getHttpServer())
      .get('/HURB/hc')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toEqual('ok');
        expect(res.body.info.currencyApi.status).toEqual('up');
        expect(res.body.info.database.status).toEqual('up');
        expect(res.body.info.microservice.status).toEqual('up');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});