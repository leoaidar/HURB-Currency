import { Controller, Post, Get, Body, Param, Query, HttpException, HttpStatus, UseInterceptors, Logger } from '@nestjs/common';
import { CurrencyService } from '../services/currency.service';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { CreateCurrencyDto } from '../dto/create-currency.dto';
import { IdParamDto } from '../dto/id-param.dto';
import { TransformInterceptor } from '../../../core/interceptors/transform.interceptor';
import { CurrencyNotFoundException } from 'src/exceptions/currency-not-found.exception';
import { CurrencyFailedCreateException } from 'src/exceptions/currency-failed-create.exception';
import { CurrencyFailedExchangeException } from 'src/exceptions/currency-failed-exchange.exception';

@Controller('currencies')
export class CurrencyController {

  private readonly logger = new Logger(CurrencyController.name);

  constructor(
    private readonly currencyService: CurrencyService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}
    
  @Post()
  @UseInterceptors(TransformInterceptor)
  async addCurrency(@Body() createCurrencyDto: CreateCurrencyDto) {
    try {
      return await this.currencyService.addCurrency(createCurrencyDto.name, createCurrencyDto.rate, createCurrencyDto.description);
    } catch (error) { 
      this.logger.error('Failed to create currency', error);     
      throw new CurrencyFailedCreateException();
    }
  }  

  @Get(':id')
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
  @UseInterceptors(TransformInterceptor)
  async getAllCurrencies() {
    return this.currencyService.getAllCurrencies();
  }
  
  @Get('convert')
  async convertCurrency(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: number
  ) {
    const rate = await this.exchangeRateService.getExchangeRate(from, [to]);
    return { result: rate.rates[to] * amount };
  }

  @Get('update-rates')
  async updateExchangeRates() {
    
    const currencies = await this.currencyService.getAllCurrencies();
    const symbols = currencies.map(c => c.id);
    const rates = await this.exchangeRateService.getExchangeRate('USD', symbols);

    // Verificar se as taxas foram recuperadas com sucesso
    if (!rates || !rates.rates) {
      this.logger.error('Failed to fetch exchange rates');
      throw new CurrencyFailedExchangeException();      
    }

    // Atualizar cada moeda com a nova taxa
    await Promise.all(currencies.map(async currency => {
      const newRate = rates.rates[currency.id];
      if (newRate) {
        return this.currencyService.updateCurrencyRate(currency.id, newRate);
      }
    }));

    this.logger.log('Exchange rates updated successfully');
    return { message: 'Exchange rates updated successfully' };
  }
  
}