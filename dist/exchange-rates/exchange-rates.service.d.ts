import { SupabaseService } from '../supabase/supabase.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
export declare class ExchangeRatesService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createDto: CreateExchangeRateDto, storeId?: string): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    getRate(fromCurrency: string, toCurrency: string): Promise<any>;
    convert(amount: number, fromCurrency: string, toCurrency: string): Promise<{
        original_amount: number;
        original_currency: string;
        converted_amount: number;
        target_currency: string;
        rate: any;
        effective_date: any;
    }>;
    update(id: string, updateDto: UpdateExchangeRateDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
