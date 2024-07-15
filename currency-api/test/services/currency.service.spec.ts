import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from '../../src/modules/currency/services/currency.service';
import { getModelToken } from '@nestjs/mongoose';
import { Currency } from '../../src/modules/currency/models/currency.model';
import { ExchangeRateService } from '../../src/modules/currency/services/exchange-rate.service';

describe('CurrencyServiceTest', () => {
  let service: CurrencyService;
  let model: any;

  beforeEach(async () => {
    const mockModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn().mockReturnThis(),
      findOneAndDelete: jest.fn().mockReturnThis(),
      create: jest.fn().mockResolvedValue(undefined),
      exec: jest.fn().mockResolvedValue(undefined)
    };

    mockModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(undefined)
    });
    mockModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(undefined)
    });
    mockModel.findOneAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(undefined)
    });
    mockModel.create.mockReturnValue({
      exec: jest.fn().mockResolvedValue(undefined)
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: getModelToken(Currency.name),
          useValue: mockModel
        },
        {
          provide: ExchangeRateService,
          useValue: { getExchangeRate: jest.fn() }
        }
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
    model = module.get(getModelToken(Currency.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addCurrency', () => {
    it('should successfully add a new currency', async () => {
      const currencyData = { code: 'USD', rate: 1, description: 'US Dollar' };
      model.create.mockResolvedValue(currencyData); // Simula a criação corretamente

      const result = await service.addCurrency(currencyData.code, currencyData.rate, currencyData.description);
      expect(result).toEqual(currencyData);
    });
  });

  describe('getCurrency', () => {
    it('should return a currency by id', async () => {
      const currencyData = { id: '1', code: 'USD', rate: 1, description: 'US Dollar' };
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(currencyData) });

      const result = await service.getCurrency('1');
      expect(result).toEqual(currencyData);
    });

    it('should return null if currency not found', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await service.getCurrency('unknown');
      expect(result).toBeNull();
    });
  });

  describe('updateCurrencyRate', () => {
    it('should update the currency rate', async () => {
      const currencyData = { id: '1', code: 'USD', rate: 1, description: 'US Dollar' };
      const newRate = 2;
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...currencyData, rate: newRate })
      });

      const result = await service.updateCurrencyRate('1', newRate);
      expect(result.rate).toEqual(newRate);
    });
  });

});