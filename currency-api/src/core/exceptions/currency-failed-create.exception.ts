import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './custom-http.exception';

export class CurrencyFailedCreateException extends CustomHttpException {
  constructor() {
    super('', HttpStatus.BAD_REQUEST);
  }
}
