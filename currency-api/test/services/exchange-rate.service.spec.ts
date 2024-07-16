import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import axios from 'axios';
import { Currency } from '../../src/modules/currency/models/currency.model';
import { ExchangeRateService } from '../../src/modules/currency/services/exchange-rate.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExchangeRateServiceTest', () => {
  let service: ExchangeRateService;
  let currencyModel: any;

  beforeEach(async () => {
    currencyModel = {
      find: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn().mockReturnThis(),
      create: jest.fn(),
      exec: jest.fn().mockResolvedValue([]) 
    };

    currencyModel.find.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue([
        { code: 'USD', rate: 1, description: 'US Dollar' },
        { code: 'EUR', rate: 0.85, description: 'Euro' }
      ])
    }));

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
          useValue: currencyModel
        }
      ],
    }).compile();

    service = module.get<ExchangeRateService>(ExchangeRateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExchangeRate', () => {
    it('should fetch exchange rates and update local database', async () => {
      const base = 'USD';
      const symbols = ['EUR', 'BRL'];
      const mockRates = {
        usd: {
          eur: 0.85,
          brl: 5.42,
        },
      };
      const mockExistingCurrencies = [
        { code: 'USD' },
        { code: 'EUR' },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockRates });
      currencyModel.find.mockResolvedValue(mockExistingCurrencies);
      currencyModel.create.mockResolvedValue({});

      const result = await service.getExchangeRate(base, symbols);

      expect(result).toEqual({
        rates: {
          eur: 0.85,
          brl: 5.42,
        },
      });

      expect(currencyModel.find).toHaveBeenCalledWith({
        code: { $in: ['EUR', 'BRL'] },
      });
      expect(currencyModel.create).toHaveBeenCalledWith({
        code: 'BRL',
        rate: 5.42,
        description: 'Description saved from External API for BRL',
      });
    });

    it('should return an empty object if the request fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API error'));

      const base = 'USD';
      const symbols = ['EUR', 'BRL'];
      const result = await service.getExchangeRate(base, symbols);

      expect(result).toEqual({ rates: {} });
    });
  });

  describe('createExistingCurrencyMap', () => {
    it('should return an object mapping existing currencies to true', () => {
      const existingCurrencies = [
        { code: 'USD' },
        { code: 'BRL' },
        { code: 'EUR' },
      ];

      const expectedMap = {
        usd: true,
        brl: true,
        eur: true,
      };

      const map = service.createExistingCurrencyMap(existingCurrencies);
      expect(map).toEqual(expectedMap);
    });

    it('should return an empty object if existingCurrencies is not an array', () => {
      const existingCurrencies = null;
      const expectedMap = {};

      const map = service.createExistingCurrencyMap(existingCurrencies);
      expect(map).toEqual(expectedMap);
    });
  });


  describe('getExchangeRate', () => {
    it('should fetch exchange rates and return formatted data', async () => {

      const expectedRates = { usd: 1, brl: 5.4 };

      mockedAxios.get.mockResolvedValue({ data:{ 
        usd: expectedRates
      }})      

      const result = await service.getExchangeRate('USD', ['BRL']);
      expect(result.rates).toEqual({ brl: 5.4 });
    });

    it('should handle external API errors ARTH Currency', async () => {
      mockedAxios.get.mockRejectedValue(mockedAxios.AxiosError.ERR_NETWORK);
      const result = await service.getExchangeRate('ARTH', ['EUR']);
      expect(result.rates).toEqual({});
    });
    
  });  

});