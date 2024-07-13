import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencyModule } from './modules/currency/currency.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Mmódulo disponível globalmente pra recuperar no exchange-rate.service.ts a api externa de cambio
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_CONN'),
      }),
      inject: [ConfigService],
    }),
    CurrencyModule, // importe somente o CurrencyModule
  ],
})
export class AppModule {}