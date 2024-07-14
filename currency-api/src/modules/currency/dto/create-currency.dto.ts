import { IsNotEmpty, IsString, IsNumber, Min, Length } from 'class-validator';

export class CreateCurrencyDto {

   /**
    * The currency name
    * @example ARTH
    */  
  @IsNotEmpty()
  @IsString()
  name: string;

   /**
    * The currency description
    * @example 'ARTHUR CRYPTO BITCOIN'
    */  
  @IsNotEmpty()
  @IsString()
  @Length(5, 255)
  description: string;

   /**
    * The currency rate
    * @example 1.18
    */    
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rate: number;  
}
   