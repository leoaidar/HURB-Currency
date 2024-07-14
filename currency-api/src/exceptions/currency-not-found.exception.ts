import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './custom-http.exception';

export class CurrencyNotFoundException extends CustomHttpException {
  constructor(currencyId: string) {
    super(`Currency with ID ${currencyId} not found`, HttpStatus.NOT_FOUND);
  }
}