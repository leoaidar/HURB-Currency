import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from '../models/currency.model';

@Injectable()
export class CurrencyService {
  
  private readonly logger = new Logger(CurrencyService.name);
  
  constructor(@InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>) {}

  async addCurrency(code: string, rate: number, description: string): Promise<Currency> {
    const newCurrency = new this.currencyModel({ code, rate, description });
    return await newCurrency.save();
  }

  async getCurrency(id: string): Promise<Currency | null> {
    const currency = await this.currencyModel.findOne({ id }).exec();
    if (currency) {
      return currency;
    }    
    this.logger.log(`Currency not found id: ${id}`);
    return null;
  }

  async getAllCurrencies(): Promise<Currency[]> {
    return this.currencyModel.find().exec();
  }

  async updateCurrencyRate(id: string, newRate: number): Promise<Currency | null> {  
    this.logger.log(`Updating currency rate... id: ${id}, rate: ${newRate}`);
    return this.currencyModel.findOneAndUpdate({ id: id }, { rate: newRate }, { new: true }).exec();
  }  
}