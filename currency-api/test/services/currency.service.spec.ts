import { CurrencyFailedFetchExchangeException } from '../../src/core/exceptions/currency-failed-fetch-exchange.exception';
import { CurrencyFailedCalcExchangeException } from '../../src/core/exceptions/currency-failed-calc-exchange.exception';
import { CurrencyInvalidAmountException } from '../../src/core/exceptions/currency-invalid-amount.exception';
import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from '../../src/modules/currency/services/currency.service';
import { getModelToken } from '@nestjs/mongoose';
import { Currency } from '../../src/modules/currency/models/currency.model';
import { ExchangeRateService } from '../../src/modules/currency/services/exchange-rate.service';

describe('CurrencyServiceTest', () => {
  let service: CurrencyService;
  let model: any;
  let mockExchangeRateService: any;

  beforeEach(async () => {
    const mockModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn().mockReturnThis(),
      findOneAndDelete: jest.fn().mockReturnThis(),
      create: jest.fn().mockResolvedValue(undefined),
      exec: jest.fn().mockResolvedValue(undefined),
    };

    mockModel.find.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue([]),
    }));
    mockModel.findOne.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
    mockModel.findOneAndUpdate.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
    mockModel.findOneAndDelete.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));
    mockModel.create.mockImplementation((currency) => currency);

    mockExchangeRateService = {
      getExchangeRate: jest
        .fn()
        .mockResolvedValue({ rates: { usd: 1, brl: 5.43, eur: 0.85 } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: getModelToken(Currency.name),
          useValue: mockModel,
        },
        {
          provide: ExchangeRateService,
          useValue: mockExchangeRateService,
        },
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
      model.create.mockResolvedValue(currencyData);

      const result = await service.addCurrency(
        currencyData.code,
        currencyData.rate,
        currencyData.description,
      );
      expect(result).toEqual(currencyData);
    });

    it('should handle database errors during currency addition', async () => {
      model.create.mockRejectedValue(new Error('DB error'));
      await expect(service.addCurrency('USD', 1, 'US Dollar')).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('getCurrency', () => {
    it('should return a currency by id', async () => {
      const currencyData = {
        id: '1',
        code: 'USD',
        rate: 1,
        description: 'US Dollar',
      };
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(currencyData),
      });

      const result = await service.getCurrency('1');
      expect(result).toEqual(currencyData);
    });

    it('should return null if currency not found', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getCurrency('unknown');
      expect(result).toBeNull();
    });
  });

  describe('updateCurrencyRate', () => {
    it('should update the currency rate', async () => {
      const currencyData = {
        id: '1',
        code: 'USD',
        rate: 1,
        description: 'US Dollar',
      };
      const newRate = 2;
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...currencyData, rate: newRate }),
      });

      const result = await service.updateCurrencyRate('1', newRate);
      expect(result.rate).toEqual(newRate);
    });

    it('should return null if the currency does not exist', async () => {
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.updateCurrencyRate('unknown', 2);
      expect(result).toBeNull();
    });
  });

  describe('deleteCurrency', () => {
    it('should delete a currency by id', async () => {
      model.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          id: '1',
          code: 'USD',
          rate: 1,
          description: 'US Dollar',
        }),
      });

      const result = await service.deleteCurrency('1');
      expect(result.deleted).toBeTruthy();
      expect(result.message).toBeUndefined();
    });

    it('should return not found if currency to delete does not exist', async () => {
      model.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.deleteCurrency('unknown');
      expect(result.deleted).toBeFalsy();
      expect(result.message).toEqual('Currency not found');
    });

    it('should handle not found for delete operation', async () => {
      model.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const result = await service.deleteCurrency('fake_id');
      expect(result.deleted).toBeFalsy();
      expect(result.message).toEqual('Currency not found');
    });
  });

  describe('convertCurrency', () => {
    it('should convert currency amounts', async () => {
      const result = await service.convertCurrency('USD', 'EUR', '100');
      expect(result.value).toEqual(85);
    });

    it('should throw an error if invalid amount provided', async () => {
      await expect(
        service.convertCurrency('USD', 'EUR', 'invalid'),
      ).rejects.toThrow('Invalid amount provided');
    });

    it('should throw an CurrencyInvalidAmountException if invalid amount provided', async () => {
      await expect(
        service.convertCurrency('USD', 'EUR', 'invalid'),
      ).rejects.toThrow(CurrencyInvalidAmountException);
    });

    it('should convert currency amounts based on BRL rates', async () => {
      const parsedAmount = 100;
      const expectedBrl = 543.0;
      jest
        .spyOn(service, 'convertCurrencyByRateUSD')
        .mockResolvedValue(expectedBrl);

      const result = await service.convertCurrency(
        'USD',
        'BRL',
        parsedAmount.toString(),
      );
      expect(result.value).toEqual(expectedBrl);
    });

    it('should handle exceptions when rates are not available', async () => {
      mockExchangeRateService.getExchangeRate.mockResolvedValue({ rates: {} });

      await expect(
        service.convertCurrency('USD', 'BRL', '100'),
      ).rejects.toThrow(CurrencyFailedCalcExchangeException);
    });

    it('should throw error if rate not found locally', async () => {
      mockExchangeRateService.getExchangeRate.mockResolvedValue({ rates: {} });
      model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      await expect(
        service.convertCurrency('USD', 'EUR', '100'),
      ).rejects.toThrow(CurrencyFailedCalcExchangeException);
    });

    it('should throw error if input amount is invalid', async () => {
      await expect(
        service.convertCurrency('USD', 'EUR', 'invalid'),
      ).rejects.toThrow(CurrencyInvalidAmountException);
    });
  });

  describe('updateCurrency', () => {
    it('should update an existing currency', async () => {
      const updateCurrencyDto = { rate: 2, description: 'Updated US Dollar' };
      const currencyData = {
        id: '1',
        code: 'USD',
        rate: 1,
        description: 'US Dollar',
      };
      model.findOneAndUpdate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...currencyData, ...updateCurrencyDto }),
      });

      const result = await service.updateCurrency('USD', updateCurrencyDto);
      expect(result.rate).toEqual(2);
      expect(result.description).toEqual('Updated US Dollar');
    });

    it('should return null if the currency to update does not exist', async () => {
      const updateCurrencyDto = { rate: 2, description: 'Updated US Dollar' };
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.updateCurrency('XYZ', updateCurrencyDto);
      expect(result).toBeNull();
    });
  });

  describe('createExistingCurrencyMap', () => {
    it('should create a map of existing currencies', () => {
      const existingCurrencies = [
        { code: 'USD', rate: 1, description: 'US Dollar' },
        { code: 'EUR', rate: 0.9, description: 'Euro' },
      ];
      const expectedMap = {
        usd: true,
        eur: true,
      };

      const result = service.createExistingCurrencyMap(existingCurrencies);
      expect(result).toEqual(expectedMap);
    });

    it('should return an empty map if no currencies are provided', () => {
      const result = service.createExistingCurrencyMap([]);
      expect(result).toEqual({});
    });

    it('should handle cases where input is not an array', () => {
      const result = service.createExistingCurrencyMap(null);
      expect(result).toEqual({});
    });
  });

  describe('updateCurrencyRates', () => {
    it('should throw exception when external API fails', async () => {
      mockExchangeRateService.getExchangeRate.mockRejectedValue(
        new CurrencyFailedFetchExchangeException(),
      );
      await expect(service.updateCurrencyRates(['ARTH'])).rejects.toThrow(
        CurrencyFailedFetchExchangeException,
      );
    });

    it('should handle empty symbols and fetch all currencies', async () => {
      mockExchangeRateService.getExchangeRate.mockResolvedValue({
        rates: { usd: 1 },
      });
      model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      await expect(service.updateCurrencyRates()).resolves.toEqual(
        'Exchange rates updated successfully',
      );
    });
  });
});
