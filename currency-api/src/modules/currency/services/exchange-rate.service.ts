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
      const rates = response.data[base.toLowerCase()]; // Access rates under the base currency key

      const result = {};
      symbols.forEach(symbol => {
        // Access rates using exact currency codes as they appear in the API response
        const symbolKey = symbol.toLowerCase();
        if (rates[symbolKey]) {
          result[symbolKey] = rates[symbolKey];
        }
      });

      this.logger.log(`Currency conversion rates retrieved: ${JSON.stringify(result)}`);
      return { rates: result };
    } catch (error) {
      this.logger.error(`Error fetching exchange rates: ${error}`);
      throw new Error('Failed to fetch exchange rates');
    }
  }

}