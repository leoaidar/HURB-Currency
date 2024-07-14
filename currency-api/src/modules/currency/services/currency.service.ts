import { CurrencyFailedFetchExchangeException } from './../../../exceptions/currency-failed-fetch-exchange.exception';
import { CurrencyInvalidAmountException } from './../../../exceptions/currency-invalid-amount.exception';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrencyFailedCalcExchangeException } from 'src/exceptions/currency-failed-calc-exchange.exception';
import { Currency, CurrencyDocument } from '../models/currency.model';
import { ExchangeRateService } from './exchange-rate.service';

@Injectable()
export class CurrencyService {
  
  private readonly logger = new Logger(CurrencyService.name);
  
  constructor(
    @InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>,
    private exchangeRateService: ExchangeRateService 
  ) {}

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

  // Atualiza as taxas de câmbio
  async updateCurrencyRates(currencySymbols?: string[]): Promise<string> {    
    
    this.logger.log(`currencySymbols[]: ${currencySymbols} `);
    // Buscar as moedas baseadas nos símbolos enviados ou trazer todas caso veio vazio
    const currencies = currencySymbols?.length 
      ? await this.getCurrenciesBySymbols(currencySymbols)
      : await this.getAllCurrencies();
      
    this.logger.log(`currencies: ${currencies} `);

    const symbols = currencies.map(c => c.code);
    
    // Buscar as taxas de câmbio usando o Dollar(USD) como moeda base 
    const currencyRates = await this.exchangeRateService.getExchangeRate('USD', symbols);

    if (!currencyRates || !currencyRates.rates) {
      throw new CurrencyFailedFetchExchangeException();
    }

    // Atualizar cada moeda com a nova taxa
    await Promise.all(currencies.map(async (currency) => {
      const newRate = currencyRates.rates[currency.code.toLowerCase()];
      if (newRate) {
        await this.updateCurrencyRate(currency.id, newRate);
        this.logger.log(`Updated ${currency.code.toUpperCase()} with rate ${newRate}`);
      }
    }));

    return 'Exchange rates updated successfully';
  }

  // Realiza a conversao baseado na taxa de cambio atual
  async convertCurrency(from: string, to: string, amount: string): Promise<{ value: number }> {

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !/^[\d]+(\.[\d]{1,2})?$/.test(amount)) {
      this.logger.log('Valor inválido fornecido. Assegure que é um número com até 2 casas decimais.');
      throw new CurrencyInvalidAmountException();
    }

    // Chama a api externa de integracao de cambio
    const currenciesRates = await this.exchangeRateService.getExchangeRate(from, [to]);
    this.logger.log(`Taxas de câmbio obtidas: ${JSON.stringify(currenciesRates)}`);
    
    const rate = currenciesRates.rates[to.toLowerCase()];
    if (!rate) {
      this.logger.log('Falha ao buscar ou calcular a taxa de câmbio');
      throw new CurrencyFailedCalcExchangeException();
    }
    this.logger.log(`Taxa de câmbio para ${to}: ${rate}`);
    
    // Faz o arrendondamento matemático antes do retorno
    const value = parseFloat((rate * parsedAmount).toFixed(2));
    this.logger.log(`Resultado da conversão: ${value}`);
  
    return { value };
  }  

}