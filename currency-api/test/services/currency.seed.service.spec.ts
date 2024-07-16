import { Test, TestingModule } from '@nestjs/testing';
import { CurrencySeedService } from '../../src/modules/currency/services/currency.seed.service';
import { getModelToken } from '@nestjs/mongoose';
import { Currency } from '../../src/modules/currency/models/currency.model';

describe('CurrencySeedServiceTest', () => {
  let service: CurrencySeedService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = {
      find: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
    };

    mockModel.findOne.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue([])
    }));

    mockModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([])
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencySeedService,
        {
          provide: getModelToken(Currency.name),
          useValue: mockModel
        }
      ],
    }).compile();

    service = module.get<CurrencySeedService>(CurrencySeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {


    it('should seed currencies if any currency exist', async () => {
      mockModel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      });
      await service.onModuleInit();
      expect(mockModel.create).toHaveBeenCalledTimes(5);
    });

        
    it('should seed missing currencies', async () => {
      mockModel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([{ code: 'USD' }, { code: 'EUR' }])
      });
      await service.onModuleInit();
      expect(mockModel.create).toHaveBeenCalledTimes(3);
    });

    it('should not create currencies if all initial currencies already exist', async () => {
      mockModel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([{ code: 'USD' }, { code: 'EUR' }, { code: 'BRL' }, { code: 'BTC' }, { code: 'ETH' }])
      });
      await service.onModuleInit();
      expect(mockModel.create).not.toHaveBeenCalled();
    });
    
  });

});