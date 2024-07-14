import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpStatus,
  UseInterceptors,
  Logger,
  HttpException,
  UsePipes,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CurrencyService } from '../services/currency.service';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { CreateCurrencyDto } from '../dto/create-currency.dto';
import { IdParamDto } from '../dto/id-param.dto';
import { TransformInterceptor } from '../../../core/interceptors/transform.interceptor';
import { CurrencyNotFoundException } from 'src/exceptions/currency-not-found.exception';
import { CurrencyFailedCreateException } from 'src/exceptions/currency-failed-create.exception';
import { CurrencyFailedExchangeException } from 'src/exceptions/currency-failed-exchange.exception';

@ApiTags('currencies')
@Controller('currencies')
export class CurrencyController {
  private readonly logger = new Logger(CurrencyController.name);

  constructor(
    private readonly currencyService: CurrencyService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a new currency' })
  @ApiResponse({ status: 201, description: 'Currency successfully created.' })
  @ApiResponse({ status: 400, description: 'Failed to create currency' })
  @ApiBody({ type: CreateCurrencyDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(TransformInterceptor)
  async addCurrency(@Body() createCurrencyDto: CreateCurrencyDto) {
    try {
      return await this.currencyService.addCurrency(
        createCurrencyDto.code,
        createCurrencyDto.rate,
        createCurrencyDto.description,
      );
    } catch (error) {
      this.logger.error('Failed to create currency', error);
      throw new CurrencyFailedCreateException();
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a currency by ID' })
  @ApiResponse({
    status: 200,
    description: 'Currency details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the currency to retrieve',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(TransformInterceptor)
  async getCurrency(@Param() params: IdParamDto) {
    const currency = await this.currencyService.getCurrency(params.id);
    if (!currency) {
      this.logger.error(`Currency not found ${params.id} `);
      throw new CurrencyNotFoundException(params.id);
    }
    return currency;
  }

  @Get()
  @ApiOperation({ summary: 'Get all currencies' })
  @ApiResponse({
    status: 200,
    description: 'All currencies retrieved successfully',
  })
  @UseInterceptors(TransformInterceptor)
  async getAllCurrencies() {
    return this.currencyService.getAllCurrencies();
  }

  @Get('convert/:from/:to/:amount')
  @ApiOperation({ summary: 'Convert an amount from one currency to another' })
  @ApiParam({ name: 'from', type: 'string', description: 'Currency code to convert from' })
  @ApiParam({ name: 'to', type: 'string', description: 'Currency code to convert to' })
  @ApiParam({ name: 'amount', type: 'string', description: 'Amount to convert' })
  @ApiResponse({ status: 200, description: 'Currency conversion result' })
  @ApiResponse({ status: 400, description: 'Invalid input' })  
  async convertCurrency(
    @Param('from') from: string,
    @Param('to') to: string,
    @Param('amount') amount: string
  ) {
    // Validando o amount para assegurar que não possui mais de duas casas decimais
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !/^[\d]+(\.[\d]{1,2})?$/.test(amount)) {
      throw new HttpException('Invalid amount provided. Ensure it is a number with up to 2 decimal places.', HttpStatus.BAD_REQUEST);
    }
  
    const currenciesRates = await this.exchangeRateService.getExchangeRate(from, [to]);
    this.logger.log(`Currencies rates retrieved: ${JSON.stringify(currenciesRates)}`);
    
    const rate = currenciesRates.rates[to.toLowerCase()];
    if (!rate) {
      throw new HttpException('Failed to fetch or calculate exchange rate', HttpStatus.BAD_REQUEST);
    }
    this.logger.log(`Exchange rate for ${to}: ${rate}`);
    
    // Calculando e arredondando o valor da conversão para duas casas decimais
    const value = parseFloat((rate * parsedAmount).toFixed(2));
    this.logger.log(`Conversion result: ${value}`);
  
    return { value };
  } 

  @Put('update-rates')
  @ApiOperation({ summary: 'Update currency exchange rates' })
  @ApiResponse({ status: 200, description: 'Exchange rates updated successfully' })
  @ApiResponse({ status: 500, description: 'Failed to update exchange rates' })
  async updateExchangeRates() {
    // Obter todas as moedas disponíveis no sistema
    const currencies = await this.currencyService.getAllCurrencies();
    const symbols = currencies.map((c) => c.code);
  
    // Buscar taxas de câmbio usando a moeda base USD
    const currenciesRates = await this.exchangeRateService.getExchangeRate('USD', symbols);
  
    
    this.logger.log(`Currencies rates retrieved: ${JSON.stringify(currenciesRates)}`);
    
    // Verificar se as taxas foram recuperadas com sucesso
    if (!currenciesRates || !currenciesRates.rates) {
      this.logger.error('Failed to fetch exchange rates');
      throw new CurrencyFailedExchangeException();
    }
  
    // Atualizar cada moeda com a nova taxa
    await Promise.all(currencies.map(async (currency) => {
      const newRate = currenciesRates.rates[currency.code.toLowerCase()]; // Asegure-se de acessar com lowercase para corresponder ao formato da API
      if (newRate) {        
        this.logger.log(`Updating ${currency.code.toUpperCase()}, rates: ${newRate}.`);
        return this.currencyService.updateCurrencyRate(currency.id, newRate);
      }
    }));
  
    this.logger.log('Exchange rates updated successfully');
    return { message: 'Exchange rates updated successfully' };
  }

}
