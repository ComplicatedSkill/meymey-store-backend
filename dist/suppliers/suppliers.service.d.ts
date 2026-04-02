import { SupabaseService } from '../supabase/supabase.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export { CreateSupplierDto, UpdateSupplierDto };
export declare class SuppliersService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createSupplierDto: CreateSupplierDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
