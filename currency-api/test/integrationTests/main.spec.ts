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

  it('should start and succefull health check detailed', async () => {
    const expectedResponse = {
      currencyQuoteAPI: 'UP',
      database: 'UP',
      microservice: 'UP'
    };

    await request(app.getHttpServer())
      .get('/HURB/hc')
      .expect(200)
      .expect(expectedResponse);
  });

  it('should respond 500 and error if any service is down', async () => {
    const expectedErrorResponse = {
      currencyQuoteAPI: 'DOWN',
      database: 'UP',
      microservice: 'UP'
    };

    await request(app.getHttpServer())
      .get('/HURB/hc')
      .expect(500) 
      .expect({
        status: 'ERROR',
        message: 'One or more services are DOWN',
        healthStatus: expectedErrorResponse
      });
  });

  afterAll(async () => {
    await app.close();
  });
});