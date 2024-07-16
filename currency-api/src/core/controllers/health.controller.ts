import { CurrencySchema } from './../../modules/currency/models/currency.model';
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { connect, connection, model, Schema } from 'mongoose';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('HURB')
@Controller('HURB')
export class HealthController {

  private readonly API_URL = process.env.API_URL || 'https://latest.currency-api.pages.dev/v1/currencies';
  private readonly MONGO_CONN = process.env.MONGO_CONN || 'mongodb://localhost:27017/CurrencyDB';

  @Get('hc')
  @ApiOperation({ summary: 'This Microservice health-check' })
  @ApiResponse({
    status: 200,
    description: 'check: currency Quote API, Database, This Microservice. ',
  })
  async checkHealth() {
    const healthStatus = {
      currencyQuoteAPI: await this.checkExternalAPI(),
      database: await this.checkDatabase(),
      microservice: await this.checkInternalAPI(),
    };

    // Verifica se algum serviço está DOWN
    const isDown = Object.values(healthStatus).some(status => status === 'DOWN');

    if (isDown) {
      throw new HttpException({
        status: 'ERROR',
        message: 'One or more services are DOWN',
        healthStatus,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return healthStatus;  // Retorna 200 OK por padrão
  }

  private async checkExternalAPI(): Promise<string> {
    try {
      const response = await axios.get(`${this.API_URL}/usd.json`);
      const rates = response.data && response.data.rates;
      return rates && rates['brl'] > 0 ? 'UP' : 'DOWN';
    } catch (error) {
      return 'DOWN';
    }
  }

  private async checkDatabase(): Promise<string> {
    try {
      await connect(this.MONGO_CONN);
      const Currency = model('Currency', CurrencySchema);

      // Cria um novo registro no banco de dados
      const newCurrency = await Currency.create({
        id: '2422bf20-3ad0-46f2-ab3a-7dca04bdeb3e',
        code: 'ARTH',
        description: 'ARTHUR CRYPTO BITCOIN',
        rate: 1.18
      });
      
      const foundCurrency = await Currency.findOne({ id: newCurrency.id });

      // Deleta o registro criado anteriormente
      await Currency.findOneAndDelete({ id: newCurrency.id });

      return foundCurrency ? 'UP' : 'DOWN';
    } catch (error) {
      return 'DOWN';
    } finally {
      await connection.close();
    }
  }

  private async checkInternalAPI(): Promise<string> {
    try {
      const response = await axios.get('http://localhost:3000/currencies');
      return response.data.length > 0 ? 'UP' : 'DOWN';
    } catch (error) {
      return 'DOWN';
    }
  }
  
}
