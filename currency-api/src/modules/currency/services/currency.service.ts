import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from '../models/currency.model';

@Injectable()
export class CurrencyService {
  constructor(@InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>) {}

  async addCurrency(name: string, rate: number, description: string): Promise<Currency> {
    const newCurrency = new this.currencyModel({ name, rate, description });
    return await newCurrency.save();
  }

  async getCurrency(id: string): Promise<Currency | null> {
    const currency = await this.currencyModel.findOne({ id }).exec();
    if (currency) {
      return currency;
    }
    return null;
  }

  async getAllCurrencies(): Promise<Currency[]> {
    return this.currencyModel.find().exec();
  }

  async updateCurrencyRate(id: string, newRate: number): Promise<Currency | null> {
    return this.currencyModel.findByIdAndUpdate(id, { rate: newRate }, { new: true }).exec();
  }  
}