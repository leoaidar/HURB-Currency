import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencyController } from './controllers/currency.controller';
import { CurrencyService } from './services/currency.service';
import { Currency, CurrencySchema } from './models/currency.model';
import { ExchangeRateService } from './services/exchange-rate.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Currency.name, schema: CurrencySchema }])
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService, ExchangeRateService]
})
export class CurrencyModule {}