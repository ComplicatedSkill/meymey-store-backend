import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
export declare class ExchangeRatesController {
    private readonly exchangeRatesService;
    constructor(exchangeRatesService: ExchangeRatesService);
    create(createDto: CreateExchangeRateDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    getRate(fromCurrency: string, toCurrency: string): Promise<any>;
    convert(amount: string, fromCurrency: string, toCurrency: string): Promise<{
        original_amount: number;
        original_currency: string;
        converted_amount: number;
        target_currency: string;
        rate: any;
        effective_date: any;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdateExchangeRateDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
