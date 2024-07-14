import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ExchangeRateService {

  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly API_URL: string;

  constructor(private configService: ConfigService) {
    this.API_URL = this.configService.get<string>('API_URL');
  }  
 
  async getExchangeRate(base: string, symbols: string[]): Promise<any> {

    const url = `${this.API_URL}/${base.toLowerCase()}.json`;
    this.logger.log(`Public currency quote API call: ${url}`);

    try {
      const response = await axios.get(url);
      // Acessa as taxas sob a chave da moeda base
      const rates = response.data[base.toLowerCase()]; 

      const result = {};
      symbols.forEach(symbol => {
        const symbolKey = symbol.toLowerCase();
        if (rates && rates[symbolKey]) {
          result[symbolKey] = rates[symbolKey];
        }
      });

      this.logger.log(`Taxas de câmbio obtidas: ${JSON.stringify(result)}`);
      return { rates: result };
    } catch (error) {
      this.logger.error(`Erro ao buscar taxas de câmbio: ${error}`);
      // Retorna um objeto vazio para indicar falha ao invés de lançar uma exceção
      return { rates: {} };
    }
  }

}