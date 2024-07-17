import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './custom-http.exception';

export class CurrencyInvalidAmountException extends CustomHttpException {

  constructor() {
    super('Invalid amount provided. Ensure it is a number with up to 2 decimal places.', HttpStatus.BAD_REQUEST);
  }

}