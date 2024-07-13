import { Module } from '@nestjs/common';
import { CurrencyController } from './modules/currency/controllers/currency.controller';
import { CurrencyService } from './modules/currency/services/currency.service';

@Module({
  imports: [],
  controllers: [CurrencyController],
  providers: [CurrencyService],
})
export class AppModule {}
