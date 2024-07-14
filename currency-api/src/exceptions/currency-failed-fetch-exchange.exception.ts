import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './custom-http.exception';

export class CurrencyFailedFetchExchangeException extends CustomHttpException {

  constructor() {
    super('Failed to fetch exchange rates', HttpStatus.INTERNAL_SERVER_ERROR);
  }

}