import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import axios from 'axios';
import axiosRetry from 'axios-retry';

@ApiTags('HURB')
@Controller('HURB')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: MongooseHealthIndicator,
  ) {}

  @Get('hc')
  @HealthCheck()
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
  checkHealth() {
    return this.health.check([
      async () =>
        this.http.pingCheck(
          'currencyApi',
          'https://latest.currency-api.pages.dev/v1/currencies/usd.json',
        ),
      async () => this.db.pingCheck('database'),
      async () =>
        this.http.pingCheck('google', 'http://localhost:3000/currencies', {
          timeout: 3000, // timeout em milissegundos
          retry: 3, // número de retentativas
        }),
    ]);
  }
}
