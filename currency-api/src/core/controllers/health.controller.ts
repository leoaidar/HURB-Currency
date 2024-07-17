import { CurrencyService } from './../../modules/currency/services/currency.service';
import { CurrencySchema } from './../../modules/currency/models/currency.model';
import { Injectable } from '@nestjs/common';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { connect, connection, model } from 'mongoose';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

// Configura retentativas para o axios
axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay });

@ApiTags('HURB')
@Injectable()
@Controller('HURB')
export class HealthController {
  private readonly API_URL =
    process.env.API_URL ||
    'https://latest.currency-api.pages.dev/v1/currencies';
  private readonly MONGO_CONN =
    process.env.MONGO_CONN || 'mongodb://localhost:27017/CurrencyDB';
  private readonly logger = new Logger(HealthController.name);

  constructor(private currencyService: CurrencyService) {}

  @Get('hc')
  @ApiOperation({ summary: 'This Microservice health-check' })
  @ApiResponse({
    status: 200,
    description:
      'check: currency Quote API, Database and this Microservice are UP. ',
  })
  @ApiResponse({
    status: 500,
    description:
      'check: currency Quote API, Database and this Microservice possibly DOWN ',
  })
  async checkHealth() {
    const healthStatus = {
      currencyQuoteAPI: await this.checkExternalAPI(),
      database: await this.checkDatabase(),
      microservice: await this.checkInternalAPI(),
    };

    // Verifica se algum serviço está DOWN
    const isDown = Object.values(healthStatus).some(
      (status) => status === 'DOWN',
    );

    if (isDown) {
      this.logger.error('Health check falhou', healthStatus);
      throw new HttpException(
        {
          status: 'ERROR',
          message: 'One or more services are DOWN',
          healthStatus,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.log('Health check bem-sucedido', healthStatus);
    return healthStatus; // Retorna 200 OK por padrão
  }

  private async checkExternalAPI(): Promise<string> {
    try {
      const url = `${this.API_URL}/usd.json`;
      this.logger.log(`Public currency quote API call: ${url}`);

      const response = await axios.get(url);
      this.logger.log(
        `Currency Quote API Data: ${JSON.stringify(response.data)}`,
      );

      const rates = response.data && response.data.usd;
      const result = rates ? rates.brl : null;
      this.logger.log(`BRL rate: ${result}`);

      return result && result > 0 ? 'UP' : 'DOWN';
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Falha ao verificar a API externa', error.message);
      } else {
        this.logger.error(
          'Falha ao verificar a API externa',
          'Erro desconhecido',
        );
      }
      return 'DOWN';
    }
  }

  private async checkDatabase(): Promise<string> {
    try {
      this.logger.log('Conectando ao banco de dados...');
      await connect(this.MONGO_CONN);
      this.logger.log('Conexão com o banco de dados estabelecida.');

      const Currency = model('Currency', CurrencySchema);
      this.logger.log('Modelo de moeda carregado.');

      // Cria um novo registro no banco de dados
      this.logger.log('Criando nova moeda no banco de dados...');
      const newCurrency = await Currency.create({
        id: '402fb8ae-5976-4544-bce7-571ebd406f05',
        code: 'ARTH',
        description: 'ARTHUR CRYPTO BITCOIN',
        rate: 1.18,
      });
      this.logger.log(`Moeda criada: ${JSON.stringify(newCurrency)}`);

      // Busca a moeda criada
      this.logger.log('Buscando a moeda criada pelo ID...');
      const foundCurrency = await Currency.findOne({ id: newCurrency.id });
      this.logger.log(`Moeda encontrada: ${JSON.stringify(foundCurrency)}`);

      // Deleta o registro criado
      this.logger.log('Deletando a moeda criada...');
      await Currency.findOneAndDelete({ id: newCurrency.id });
      this.logger.log('Moeda deletada.');

      this.logger.log(
        `Moeda que foi deletada: ${JSON.stringify(foundCurrency)}`,
      );

      return foundCurrency ? 'UP' : 'DOWN';
    } catch (error: unknown) {
      this.logger.error(
        'Falha ao verificar o banco de dados',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
      return 'DOWN';
    } finally {
      this.logger.log('Fechando conexão com o banco de dados...');
      await connection.close();
      this.logger.log('Conexão com o banco de dados fechada.');
    }
  }

  private async checkInternalAPI(): Promise<string> {
    try {
      this.logger.log(
        'Tentando verificar o endpoint interno de microserviço...',
      );
      const currencies = await this.currencyService.getAllCurrencies();
      this.logger.log(
        'Resposta recebida do microserviço: ' + JSON.stringify(currencies),
      );
      return currencies.length > 0 ? 'UP' : 'DOWN';
    } catch (error) {
      this.logger.error('Falha ao verificar o serviço interno de moeda', error);
      return 'DOWN';
    }
  }
}
