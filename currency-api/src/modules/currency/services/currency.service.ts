import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from '../models/currency.model';

@Injectable()
export class CurrencyService {
  constructor(@InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>) {}

  async addCurrency(id: string, name: string, rate: number): Promise<Currency> {
    const newCurrency = new this.currencyModel({ id, name, rate });
    return await newCurrency.save();
  }

  async getCurrency(id: string): Promise<Currency | null> {
    return this.currencyModel.findOne({ id }).exec();
  }

  async getAllCurrencies(): Promise<Currency[]> {
    return this.currencyModel.find().exec();
  }

  async updateCurrencyRate(id: string, newRate: number): Promise<Currency | null> {
    return this.currencyModel.findByIdAndUpdate(id, { rate: newRate }, { new: true }).exec();
  }  
}