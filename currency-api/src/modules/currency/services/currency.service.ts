import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyService {
  getHello(): string {
    return 'Ola HURB!';
  }
}
