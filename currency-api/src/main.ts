import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades que não têm nenhum decorador no DTO
    forbidNonWhitelisted: true, // Rejeita requisições que contêm propriedades não válidas
    transform: true, // Transforma payloads para corresponder aos tipos do DTO
    disableErrorMessages: false, // Mostra mensagens de erro (desabilitar em produção por segurança)
  }));
  await app.listen(3000);
}
bootstrap();

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(3000);
// }
// bootstrap();
