import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './custom-http.exception';

export class CurrencyFailedExchangeException extends CustomHttpException {
  constructor() {
    super('Failed to update exchange rates', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
