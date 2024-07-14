import { IsString, IsNumber, IsOptional, Min, Length } from 'class-validator';

export class UpdateCurrencyDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @IsOptional()
  @IsString()
  @Length(10, 300)
  description?: string;
  
}