import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  Logger,
  UsePipes,
  ValidationPipe,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CurrencyService } from '../services/currency.service';
import { CreateCurrencyDto } from '../dto/create-currency.dto';
import { UpdateCurrencyDto } from '../dto/update-currency.dto';
import { IdParamDto } from '../dto/id-param.dto';
import { TransformInterceptor } from '../../../core/interceptors/transform.interceptor';
import { CurrencyNotFoundException } from '../../../exceptions/currency-not-found.exception';
import { CurrencyFailedCreateException } from '../../../exceptions/currency-failed-create.exception';
import { CurrencyFailedExchangeException } from '../../../exceptions/currency-failed-exchange.exception';

@ApiTags('currencies')
@Controller('currencies')
export class CurrencyController {
  
  private readonly logger = new Logger(CurrencyController.name);

  constructor(
    private readonly currencyService: CurrencyService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a new currency' })
  @ApiResponse({ status: 201, description: 'Currency successfully created.' })
  @ApiResponse({ status: 400, description: 'Failed to create currency' })
  @ApiBody({ type: CreateCurrencyDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(TransformInterceptor)
  async addCurrency(@Body() createCurrencyDto: CreateCurrencyDto) {
    try {
      return await this.currencyService.addCurrency(
        createCurrencyDto.code,
        createCurrencyDto.rate,
        createCurrencyDto.description,
      );
    } catch (error) {
      this.logger.error('Failed to create currency', error);
      throw new CurrencyFailedCreateException();
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a currency by ID' })
  @ApiResponse({
    status: 200,
    description: 'Currency details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the currency to retrieve',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(TransformInterceptor)
  async getCurrency(@Param() params: IdParamDto) {
    const currency = await this.currencyService.getCurrency(params.id);
    if (!currency) {
      this.logger.error(`Currency not found ${params.id} `);
      throw new CurrencyNotFoundException(params.id);
    }
    return currency;
  }

  @Get()
  @ApiOperation({ summary: 'Get all currencies' })
  @ApiResponse({
    status: 200,
    description: 'All currencies retrieved successfully',
  })
  @UseInterceptors(TransformInterceptor)
  async getAllCurrencies() {
    return this.currencyService.getAllCurrencies();
  }

  @Get('convert/:from/:to/:amount')
  @ApiOperation({ summary: 'Convert an amount from one currency to another' })
  @ApiParam({ name: 'from', type: 'string', description: 'Currency code to convert from' })
  @ApiParam({ name: 'to', type: 'string', description: 'Currency code to convert to' })
  @ApiParam({ name: 'amount', type: 'string', description: 'Amount to convert' })
  @ApiResponse({ status: 200, description: 'Currency conversion result' })
  @ApiResponse({ status: 400, description: 'Invalid input' })  
  async convertCurrency(
    @Param('from') from: string,
    @Param('to') to: string,
    @Param('amount') amount: string
  ) {
    return this.currencyService.convertCurrency(from, to, amount);
  }

  @Put('update-rates')
  @ApiOperation({ summary: 'Update currency exchange rates' })
  @ApiBody({
    description: 'Optional list of currency codes to update, if empty all will be updated.',
    type: [String],
    required: false // Declarar explicito o corpo da requisicao como opcional
  })
  @ApiResponse({ status: 200, description: 'Exchange rates updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Failed to update exchange rates' })
  async updateExchangeRates(@Body() currencySymbols?: string[]) {

    try {      
      const message = await this.currencyService.updateCurrencyRates(currencySymbols);
      this.logger.log(message);
      return { message };
    } catch (ex) {
      this.logger.error(ex);
      throw new CurrencyFailedExchangeException();
    }
    
  }
  
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a currency by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the currency to delete',
  })
  @ApiResponse({ status: 200, description: 'Currency deleted successfully' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteCurrency(@Param() params: IdParamDto) {
    const result = await this.currencyService.deleteCurrency(params.id);
    if (!result.deleted) {
      this.logger.error(`Failed to delete currency with ID ${params.id}`);
      throw new CurrencyNotFoundException(params.id);
    }
    return { message: 'Currency deleted successfully' };
  }  

  @Put(':code')
  @ApiOperation({ summary: 'Update a specific currency by code' })
  @ApiParam({ name: 'code', type: 'string', description: 'Currency code to update' })
  @ApiBody({ type: UpdateCurrencyDto })
  @ApiResponse({ status: 200, description: 'Currency updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(TransformInterceptor)
  async updateCurrency(
    @Param('code') code: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto
  ) {
    const result = await this.currencyService.updateCurrency(code, updateCurrencyDto);
    this.logger.log(`result: ${JSON.stringify(result)}`);
    if (!result) {
      this.logger.error(`Falha ao atualizar a moeda com o código ${code}`);
      throw new CurrencyNotFoundException(code);
    }
    return result;
  }  

}
