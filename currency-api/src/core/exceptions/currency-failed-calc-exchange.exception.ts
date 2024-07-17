import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './custom-http.exception';

export class CurrencyFailedCalcExchangeException extends CustomHttpException {

  constructor() {
    super('Failed to calculate exchange rate', HttpStatus.BAD_REQUEST);
  }
  
}