import { SupabaseService } from '../supabase/supabase.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
export declare class BrandsService {
    private supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    create(createBrandDto: CreateBrandDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateBrandDto: UpdateBrandDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
