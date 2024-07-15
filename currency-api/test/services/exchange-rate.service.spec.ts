import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Currency } from '../../src/modules/currency/models/currency.model';
import { ExchangeRateService } from '../../src/modules/currency/services/exchange-rate.service';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let mockAxios: MockAdapter;
  let mockModel: any;

  beforeEach(async () => {
    mockAxios = new MockAdapter(axios);
    mockModel = {
      find: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn().mockReturnThis(),
      create: jest.fn(),
      exec: jest.fn().mockResolvedValue([]) // Certifique-se de que o retorno padrão seja um array
    };

    // Assegura que exec é configurado para retornar arrays, pois é esperado em algumas lógicas
    mockModel.find.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue([
        { code: 'USD', rate: 1, description: 'US Dollar' },
        { code: 'EUR', rate: 0.85, description: 'Euro' }
      ])
    }));
    

    mockModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(undefined)
    });
    mockModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(undefined)
    });
    mockModel.create.mockReturnValue({
      exec: jest.fn().mockResolvedValue(undefined)
    });


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRateService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://latest.currency-api.pages.dev/v1/currencies')
          }
        },
        {
          provide: getModelToken(Currency.name),
          useValue: mockModel
        }
      ],
    }).compile();

    service = module.get<ExchangeRateService>(ExchangeRateService);
  });

  afterEach(() => {
    mockAxios.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExchangeRate', () => {
    it('should fetch exchange rates and return formatted data', async () => {
      const expectedRates = { usd: 1, eur: 0.85 };
      mockAxios.onGet('https://latest.currency-api.pages.dev/v1/currencies/usd.json').reply(200, {
        usd: expectedRates
      });

      const result = await service.getExchangeRate('USD', ['EUR']);
      expect(result.rates).toEqual({ eur: 0.85 });
    });

    it('should handle external API errors gracefully', async () => {
      mockAxios.onGet('https://latest.currency-api.pages.dev/v1/currencies/usd.json').networkError();
      const result = await service.getExchangeRate('USD', ['EUR']);
      expect(result.rates).toEqual({});
    });
  });
});