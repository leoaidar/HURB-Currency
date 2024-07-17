import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter());

  const config = new DocumentBuilder()
    .setTitle('Documentation - Currency HURB API')
    .setDescription(
      'Documentation of HURB API, which responds to JSON, for currency conversion. It must have a backing currency (USD) and make conversions between different currencies with real and live values.',
    )
    .setVersion('1.0')
    .addTag('currencies')
    .addTag('HURB')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Inserindo uma rota raiz diretamente através do adaptador Express para devolver no http://localhost:3000
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({ message: 'HURB-Microservice-Currency It Works!' });
  });

  await app.listen(3000);
}
bootstrap();
