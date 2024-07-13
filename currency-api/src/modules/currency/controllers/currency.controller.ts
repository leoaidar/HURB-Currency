import { Controller, Post, Get, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CurrencyService } from '../services/currency.service';
import { ExchangeRateService } from '../services/exchange-rate.service';

@Controller('currencies')
export class CurrencyController {

  constructor(
    private readonly currencyService: CurrencyService,
    private readonly exchangeRateService: ExchangeRateService
  ) {}
  
  @Post()
  async addCurrency(@Body() createCurrencyDto: { id: string; name: string; rate: number }) {
    return this.currencyService.addCurrency(createCurrencyDto.id, createCurrencyDto.name, createCurrencyDto.rate);
  }

  @Get(':id')
  async getCurrency(@Param('id') id: string) {
    return this.currencyService.getCurrency(id);
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

    // Verifica se as taxas foram recuperadas com sucesso
    if (!rates || !rates.rates) {
      throw new HttpException('Failed to fetch exchange rates', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Atualiza cada moeda com a nova taxa
    await Promise.all(currencies.map(async currency => {
      const newRate = rates.rates[currency.id];
      if (newRate) {
        return this.currencyService.updateCurrencyRate(currency.id, newRate);
      }
    }));

    // Retorna uma resposta indicando sucesso
    return { message: 'Exchange rates updated successfully' };
  }
  
}