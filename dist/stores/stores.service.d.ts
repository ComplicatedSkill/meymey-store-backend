import { SupabaseService } from '../supabase/supabase.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
export declare class StoresService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createStoreDto: CreateStoreDto, userId: string): Promise<any>;
    findAll(userId: string): Promise<any>;
    findOne(id: string, userId: string): Promise<any>;
    update(id: string, updateStoreDto: UpdateStoreDto, userId: string): Promise<any>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
