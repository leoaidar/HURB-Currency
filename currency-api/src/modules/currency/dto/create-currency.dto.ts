import { IsNotEmpty, IsString, IsNumber, Min, Length } from 'class-validator';

export class CreateCurrencyDto {

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rate: number;
  
  @IsNotEmpty()
  @IsString()
  @Length(5, 255)
  description: string;

}