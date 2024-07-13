import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CurrencyService } from '../services/currency.service';

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  async addCurrency(@Body() createCurrencyDto: { code: string; name: string; rate: number }) {
    return this.currencyService.addCurrency(createCurrencyDto.code, createCurrencyDto.name, createCurrencyDto.rate);
  }

  @Get(':code')
  async getCurrency(@Param('code') code: string) {
    return this.currencyService.getCurrency(code);
  }
}