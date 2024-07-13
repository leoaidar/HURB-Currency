import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ExchangeRateService {

  // Utilizei essa api ela é grátis mediante cadastro liberado 100 chamadas
  // https://fixer.io/
  //Foreign exchange rates and currency conversion JSON API
  private readonly API_URL: string;
  private readonly API_KEY: string;

  constructor(private configService: ConfigService) {
    this.API_URL = this.configService.get<string>('API_URL');
    this.API_KEY = this.configService.get<string>('API_KEY');
  }

  async getExchangeRate(base: string, symbols: string[]): Promise<any> {
    const url = `${this.API_URL}?access_key=${this.API_KEY}&base=${base}&symbols=${symbols.join(',')}`;
    const response = await axios.get(url);
    return response.data;
  }

}