import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreateExchangeRateDto, storeId?: string) {
    const payload: any = { ...createDto };
    if (storeId) payload.store_id = storeId;
    const { data, error } = await this.supabaseService
      .getClient()
      .from('exchange_rates')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('exchange_rates')
      .select('*')
      .order('effective_date', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('exchange_rates')
      .select('*')
      .eq('id', id)
      .single();
    if (error)
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    return data;
  }

  async getRate(fromCurrency: string, toCurrency: string) {
    if (fromCurrency === toCurrency)
      return { from_currency: fromCurrency, to_currency: toCurrency, rate: 1 };

    const { data: directRate } = await this.supabaseService
      .getClient()
      .from('exchange_rates')
      .select('*')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .lte('effective_date', new Date().toISOString().split('T')[0])
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();
    if (directRate) return directRate;

    const { data: inverseRate } = await this.supabaseService
      .getClient()
      .from('exchange_rates')
      .select('*')
      .eq('from_currency', toCurrency)
      .eq('to_currency', fromCurrency)
      .lte('effective_date', new Date().toISOString().split('T')[0])
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();
    if (inverseRate)
      return {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate: 1 / inverseRate.rate,
        effective_date: inverseRate.effective_date,
      };

    throw new NotFoundException(
      `Exchange rate not found for ${fromCurrency} to ${toCurrency}`,
    );
  }

  async convert(amount: number, fromCurrency: string, toCurrency: string) {
    const rateData = await this.getRate(fromCurrency, toCurrency);
    return {
      original_amount: amount,
      original_currency: fromCurrency,
      converted_amount: Math.round(amount * Number(rateData.rate) * 100) / 100,
      target_currency: toCurrency,
      rate: rateData.rate,
      effective_date: rateData.effective_date,
    };
  }

  async update(id: string, updateDto: UpdateExchangeRateDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('exchange_rates')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('exchange_rates')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Exchange rate deleted successfully' };
  }
}
