import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from './currency.service';
import { Currency, CurrencySchema } from '../models/currency.model';
import { getModelToken } from '@nestjs/mongoose';

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: getModelToken(Currency.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findByIdAndRemove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Testes para cada método
});