import { AppModule } from './../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';

describe('Application HURB', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    await app.init();
  });

  it('should start and respond to a health check', async () => {
    await request(app.getHttpServer())
      .get('/health/check')
      .expect(200)
      .expect({ status: 'OK' }); 
  });

  it('should start and respond service api OK from health check', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/check')
      .expect(200);
    expect(response.text).toContain('OK');
  });  

  afterAll(async () => {
    await app.close();
  });
});