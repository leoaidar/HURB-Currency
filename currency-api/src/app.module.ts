import { HealthController } from './core/controllers/health.controller';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpHealthIndicator, TerminusModule } from '@nestjs/terminus';
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
    CurrencyModule, // importar somente o CurrencyModule funcionou
    HttpModule,
    TerminusModule
  ],
  controllers: [HealthController], // health-check
  providers: [],  
})
export class AppModule {}