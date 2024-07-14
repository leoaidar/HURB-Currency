import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from '../models/currency.model';

@Injectable()
export class CurrencyService {
  
  private readonly logger = new Logger(CurrencyService.name);
  
  constructor(@InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>) {}

  // Adicionar uma nova moeda no Mongodb
  async addCurrency(code: string, rate: number, description: string): Promise<Currency> {
    const newCurrency = new this.currencyModel({ code, rate, description });
    return await newCurrency.save();
  }

  // Buscar uma moeda pelo ID
  async getCurrency(id: string): Promise<Currency | null> {
    const currency = await this.currencyModel.findOne({ id }).exec();
    if (currency) {
      return currency;
    }    
    this.logger.log(`Currency not found id: ${id}`);
    this.logger.log(`Moeda não encontrada pelo ID: ${id}`);
    return null;
  }

  // Retornar todas as moedas do banco de dados
  async getAllCurrencies(): Promise<Currency[]> {
    return this.currencyModel.find().exec();
  }

  // Atualizar a nova taxa de uma moeda por ID
  async updateCurrencyRate(id: string, newRate: number): Promise<Currency | null> {  
    this.logger.log(`Updating currency rate... id: ${id}, rate: ${newRate}`);
    this.logger.log(`Atualizando a taxa da moeda... ID: ${id}, taxa: ${newRate}`);
    return this.currencyModel.findOneAndUpdate({ id: id }, { rate: newRate }, { new: true }).exec();
  }

  // Buscar moedas por uma array de símbolos de cada moeda
  async getCurrenciesBySymbols(symbols: string[]): Promise<Currency[]> {
    return this.currencyModel.find({ code: { $in: symbols } }).exec();
  }
  
}