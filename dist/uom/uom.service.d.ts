import { SupabaseService } from '../supabase/supabase.service';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdateUomDto } from './dto/update-uom.dto';
export declare class UomService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createUomDto: CreateUomDto, storeId: string): Promise<any>;
    findAll(storeId: string): Promise<any[]>;
    findOne(id: string, storeId: string): Promise<any>;
    update(id: string, updateUomDto: UpdateUomDto, storeId: string): Promise<any>;
    remove(id: string, storeId: string): Promise<{
        message: string;
    }>;
}
