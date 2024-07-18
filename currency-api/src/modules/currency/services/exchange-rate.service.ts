import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from '../models/currency.model';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly API_URL: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>,
  ) {
    this.API_URL = this.configService.get<string>('API_URL');
  }

  // Função para mapear moedas existentes
  createExistingCurrencyMap(
    existingCurrencies: any[],
  ): Record<string, boolean> {
    if (!Array.isArray(existingCurrencies)) {
      return {};
    }
    return existingCurrencies.reduce((currenciesFound, currentElement) => {
      currenciesFound[currentElement.code.toLowerCase()] = true;
      return currenciesFound;
    }, {});
  }

  async getExchangeRate(base: string, symbols: string[]): Promise<any> {
    const url = `${this.API_URL}/${base.toLowerCase()}.json`;
    this.logger.log(`Public currency quote API call: ${url}`);

    try {
      const response = await axios.get(url);
      // Acessa as taxas sob a chave da moeda base
      const rates = response.data[base.toLowerCase()];
      const result = {};

      // Constrói o retorno deste método
      for (const symbol of symbols) {
        const symbolKey = symbol.toLowerCase();
        if (rates && rates[symbolKey]) {
          result[symbolKey] = rates[symbolKey];
        }
      }


      // // Transforma o JSON em uma matriz
      // const rateEntries = Object.entries(rates);
      // // Separa num array somente o símbolo da moeda
      // const currencyArray = rateEntries.map(([currency]) => currency);
      

      // const allCurrenciesSaved = await this.currencyModel.find().exec();
      
      // // Busca no banco quais moedas já existem
      // const existingCurrencies = allCurrenciesSaved.filter((c)=>!currencyArray.includes(c.code) )

      
      // // // Busca no banco quais moedas já existem
      // // const existingCurrencies = await this.currencyModel.find({
      // //   code: { $in: currencyArray.map((symbol) => symbol.toUpperCase()) },
      // // });

      // const existingCurrencyMap =
      //   this.createExistingCurrencyMap(existingCurrencies);

      // this.logger.log(
      //   `existingCurrencyMap: ${JSON.stringify(existingCurrencyMap)}`,
      // );

      // // Aproveita para atualizar a base local com novas moedas
      // for (const [currency, rate] of rateEntries) {
      //   const symbolKey = currency.toLowerCase();
      //   // Verifica se a moeda já existe no banco de dados
      //   if (!existingCurrencyMap[symbolKey]) {
      //     // Se não existir, cria uma nova entrada
      //     await this.currencyModel.create({
      //       code: currency.toUpperCase(),
      //       rate: rate,
      //       description: `Description saved from External API for ${symbolKey.toUpperCase()}`,
      //     });
      //     this.logger.log(
      //       `Nova moeda salva: ${currency.toUpperCase()} com taxa ${rates[symbolKey]}`,
      //     );
      //   }
      // }

      this.logger.log(
        `Taxas de câmbio obtidas da API: ${JSON.stringify(result)}`,
      );
      return { rates: result };
    } catch (error) {
      this.logger.error(`Erro ao buscar taxas de câmbio: ${error}`);
      // Retorna um objeto vazio para indicar falha ao invés de lançar uma exceção
      return { rates: {} };
    }
  }
}
