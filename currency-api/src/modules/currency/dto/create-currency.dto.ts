import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateCurrencyDto {

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rate: number;
  
}