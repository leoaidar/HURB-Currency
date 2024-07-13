import { Injectable } from '@nestjs/common';
import Currency, { ICurrency } from '../models/currency.model';

@Injectable()
export class CurrencyService {
  async addCurrency(code: string, name: string, rate: number): Promise<ICurrency> {
    const newCurrency = new Currency({ code, name, rate });
    return await newCurrency.save();
  }

  async getCurrency(code: string): Promise<ICurrency | null> {
    return Currency.findOne({ code });
  }
  
}