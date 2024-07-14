import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
//import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Documentation - Currenc HURB API')
    .setDescription('Documentation of HURB API, which responds to JSON, for currency conversion. It must have a backing currency (USD) and make conversions between different currencies with real and live values.')
    .setVersion('1.0')
    .addTag('currencies')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true, // Remove propriedades que não têm nenhum decorador no DTO
  //   forbidNonWhitelisted: true, // Rejeita requisições que contêm propriedades não válidas
  //   transform: true, // Transforma payloads para corresponder aos tipos do DTO
  //   disableErrorMessages: false, // Mostra mensagens de erro (desabilitar em produção por segurança)
  // }));

  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  //   forbidNonWhitelisted: true,
  //   transform: true,
  //   disableErrorMessages: false,
  // }));  

  await app.listen(3000);  
  //const open = (await import('open')).default;
  //open('http://localhost:3000/api');
}
bootstrap();
