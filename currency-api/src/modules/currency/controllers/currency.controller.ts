import { Controller, Get } from '@nestjs/common';
import { CurrencyService } from '../services/currency.service';

@Controller()
export class CurrencyController {
  constructor(private readonly appService: CurrencyService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
