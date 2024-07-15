import { IsString, IsNumber, IsOptional, Min, Length, IsNotEmpty } from 'class-validator';

export class UpdateCurrencyDto {
  
    /**
     * Optional description for the currency.
     * @example 'ARTHUR CRYPTO BITCOIN'
     */
    @IsOptional()
    @IsString()
    @Length(5, 255)
    description?: string;
  
    /**
     * Optional new rate for the currency.
     * @example 1.18
     */
    @IsOptional()
    @IsNumber()
    @Min(0)
    rate?: number;
}