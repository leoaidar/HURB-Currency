import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyController } from '../../src/modules/currency/controllers/currency.controller';
import { CurrencyService } from '../../src/modules/currency/services/currency.service';
import { CreateCurrencyDto } from '../../src/modules/currency/dto/create-currency.dto';
import { UpdateCurrencyDto } from '../../src/modules/currency/dto/update-currency.dto';
import { IdParamDto } from '../../src/modules/currency/dto/id-param.dto';
import { NotFoundException } from '@nestjs/common';

describe('CurrencyControllerTest', () => {
  let controller: CurrencyController;
  let service: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyController],
      providers: [
        {
          provide: CurrencyService,
          useValue: {
            addCurrency: jest.fn(),
            getCurrency: jest.fn(),
            getAllCurrencies: jest.fn(),
            convertCurrency: jest.fn(),
            updateCurrencyRates: jest.fn(),
            deleteCurrency: jest.fn(),
            updateCurrency: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CurrencyController>(CurrencyController);
    service = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addCurrency', () => {
    it('should create a new currency', async () => {
      const dto = new CreateCurrencyDto();
      const result = { id: '1', code: 'USD', rate: 1, description: 'Dollar' };

      jest.spyOn(service, 'addCurrency').mockImplementation(async () => result);

      expect(await controller.addCurrency(dto)).toBe(result);
    });
  });

  describe('getCurrency', () => {
    it('should retrieve a currency by ID', async () => {
      const currency = { id: '1', code: 'USD', rate: 1, description: 'Dollar' };
      jest.spyOn(service, 'getCurrency').mockImplementation(async () => currency);

      expect(await controller.getCurrency({ id: '1' } as IdParamDto)).toBe(currency);
    });

    it('should throw an error if currency not found', async () => {
      jest.spyOn(service, 'getCurrency').mockImplementation(async () => null);

      await expect(controller.getCurrency({ id: '1' } as IdParamDto))
        .rejects.toThrow(new NotFoundException(`Currency with ID 1 not found`));
    });
  });

  describe('updateCurrency', () => {
    it('should update a currency', async () => {
      const dto = new UpdateCurrencyDto();
      dto.rate = 2;
      dto.description = "Updated Description";
      const code = 'USD';
      const updatedCurrency = { id: '1', code: 'USD', rate: 2, description: 'Updated Description' };

      jest.spyOn(service, 'updateCurrency').mockResolvedValue(updatedCurrency);

      expect(await controller.updateCurrency(code, dto)).toEqual(updatedCurrency);
    });
  });

  describe('getAllCurrencies', () => {
    it('should retrieve all currencies', async () => {
      const currencies = [
        { id: '1', code: 'USD', description: 'The United States dollar (symbol: $; currency code: USD; also abbreviated US$ to distinguish it from other dollar-denominated currencies; referred to as the dollar, U.S. dollar, American dollar, or colloquially buck) is the official currency of the United States and several other countries.', rate: 1 },
        { id: '2', code: 'BRL', description: 'The Brazilian real (pl. reais; sign: R$; code: BRL) is the official currency of Brazil.', rate: 5 },               
        { id: '3', code: 'EUR', description: 'The euro (symbol: €; currency code: EUR) is the official currency of 20 of the 27 member states of the European Union.', rate: 0.9 },
        { id: '4', code: 'BTC', description: 'Bitcoin (abbreviation: BTC; sign: ₿) is the first decentralized cryptocurrency. Nodes in the peer-to-peer bitcoin network verify transactions through cryptography and record them in a public distributed ledger, called a blockchain, without central oversight.', rate: 100 },
        { id: '5', code: 'ETH', description: 'Ethereum is a decentralized blockchain with smart contract functionality. Ether (Abbreviation: ETH;[a]) is the native cryptocurrency of the platform.', rate: 10 },
      ];      
  
      jest.spyOn(service, 'getAllCurrencies').mockImplementation(async () => currencies);
  
      expect(await controller.getAllCurrencies()).toBe(currencies);
    });
  });
  
  describe('convertCurrency', () => {
    it('should convert an amount from one currency USD to EUR', async () => {
      const from = 'USD';
      const to = 'EUR';
      const amount = '100';
      const result = { value: 90 };
  
      jest.spyOn(service, 'convertCurrency').mockImplementation(async () => result);
  
      expect(await controller.convertCurrency(from, to, amount)).toBe(result);
    });
  });

  describe('convertCurrency', () => {
    it('should convert an amount from one currency USD to BRL', async () => {
      const from = 'USD';
      const to = 'EUR';
      const amount = '1';
      const result = { value: 5.4 };
  
      jest.spyOn(service, 'convertCurrency').mockImplementation(async () => result);
  
      expect(await controller.convertCurrency(from, to, amount)).toBe(result);
    });
  });
  
  describe('updateCurrencyRates', () => {
    it('should update currency exchange rates', async () => {
      const currencySymbols = ['USD', 'EUR'];
      const message = 'Exchange rates updated successfully';
  
      jest.spyOn(service, 'updateCurrencyRates').mockImplementation(async () => message);
  
      expect(await controller.updateExchangeRates(currencySymbols)).toEqual({ message });
    });
  
    it('should handle updates without specific currency symbols', async () => {
      const message = 'Exchange rates updated successfully';
  
      jest.spyOn(service, 'updateCurrencyRates').mockImplementation(async () => message);
  
      expect(await controller.updateExchangeRates()).toEqual({ message });
    });
  });
  
  describe('deleteCurrency', () => {
    it('should delete a currency by ID', async () => {
      const id = '1';
      const result = { deleted: true, message: 'Currency deleted successfully' };
  
      jest.spyOn(service, 'deleteCurrency').mockImplementation(async () => result);
  
      expect(await controller.deleteCurrency({ id } as IdParamDto)).toEqual({ message: 'Currency deleted successfully' });
    });
  
    it('should throw an error if currency not found on delete', async () => {
      const id = '999';
      const result = { deleted: false, message: 'Currency not found' };
  
      jest.spyOn(service, 'deleteCurrency').mockImplementation(async () => result);
  
      await expect(controller.deleteCurrency({ id } as IdParamDto))
        .rejects.toThrow(new Error(`Currency with ID ${id} not found`));
    });
  });

});