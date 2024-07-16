import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CurrencyModule } from './../../src/modules/currency/currency.module';
import { ExchangeRateService } from './../../src/modules/currency/services/exchange-rate.service';
import { CurrencyService } from './../../src/modules/currency/services/currency.service';

describe('CurrencyModule Integration', () => {
  let currencyService: CurrencyService;
  let exchangeRateService: ExchangeRateService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        CurrencyModule,
        ConfigModule.forRoot({
          // Suponha que a API_URL é uma variável de ambiente necessária
          load: [() => ({ API_URL: 'https://latest.currency-api.pages.dev/v1/currencies' })],
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGO_CONN', 'mongodb://localhost:27017/CurrencyDBTest'),
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    currencyService = moduleRef.get<CurrencyService>(CurrencyService);
    exchangeRateService = moduleRef.get<ExchangeRateService>(ExchangeRateService);
  });

  it('should load currency services successfully', () => {
    expect(currencyService).toBeDefined();
    expect(exchangeRateService).toBeDefined();
  });
});