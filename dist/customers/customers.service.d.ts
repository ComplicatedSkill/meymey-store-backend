import { SupabaseService } from '../supabase/supabase.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createDto: CreateCustomerDto, storeId?: string): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdateCustomerDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
