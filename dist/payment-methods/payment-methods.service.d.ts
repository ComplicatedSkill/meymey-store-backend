import { SupabaseService } from '../supabase/supabase.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
export declare class PaymentMethodsService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createDto: CreatePaymentMethodDto, storeId?: string): Promise<any>;
    findAll(): Promise<any[]>;
    findActive(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdatePaymentMethodDto): Promise<any>;
    setDefault(id: string): Promise<any>;
    private unsetAllDefaults;
    remove(id: string): Promise<{
        message: string;
    }>;
}
