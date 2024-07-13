import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencyModule } from './modules/currency/currency.module';
import { CurrencyController } from './modules/currency/controllers/currency.controller';
import { CurrencyService } from './modules/currency/services/currency.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna o módulo disponível globalmente pra recuperar no exchange-rate.service.ts a api externa de cambio
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_CONN'),
      }),
      inject: [ConfigService],
    }),,
    CurrencyModule,
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
})

export class AppModule {}