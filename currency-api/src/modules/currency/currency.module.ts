import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencyController } from './controllers/currency.controller';
import { CurrencyService } from './services/currency.service';
import { Currency, CurrencySchema } from './models/currency.model';
import { ExchangeRateService } from './services/exchange-rate.service';
import { CurrencySeedService } from './services/currency.seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Currency.name, schema: CurrencySchema },
    ]),
  ],
  controllers: [CurrencyController],
  providers: [CurrencySeedService, CurrencyService, ExchangeRateService],
  exports: [CurrencyService, ExchangeRateService],
})
export class CurrencyModule {}
