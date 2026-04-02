import { SupabaseService } from '../supabase/supabase.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
export declare class TaxesService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createDto: CreateTaxDto, storeId: string): Promise<any>;
    findAll(storeId: string): Promise<any[]>;
    findOne(id: string, storeId: string): Promise<any>;
    update(id: string, updateDto: UpdateTaxDto, storeId: string): Promise<any>;
    remove(id: string, storeId: string): Promise<{
        message: string;
    }>;
}
