import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('exchange-rates')
@UseGuards(SupabaseAuthGuard)
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Post()
  create(@Body() createDto: CreateExchangeRateDto, @Request() req: any) {
    const storeId = req.user?.store?.id;
    return this.exchangeRatesService.create(createDto, storeId);
  }

  @Get()
  findAll() {
    return this.exchangeRatesService.findAll();
  }

  @Get('rate')
  getRate(
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
  ) {
    return this.exchangeRatesService.getRate(fromCurrency, toCurrency);
  }

  @Get('convert')
  convert(
    @Query('amount') amount: string,
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
  ) {
    return this.exchangeRatesService.convert(
      parseFloat(amount),
      fromCurrency,
      toCurrency,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exchangeRatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateExchangeRateDto) {
    return this.exchangeRatesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exchangeRatesService.remove(id);
  }
}
