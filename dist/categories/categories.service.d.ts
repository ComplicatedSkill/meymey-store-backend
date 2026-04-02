import { SupabaseService } from '../supabase/supabase.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createCategoryDto: CreateCategoryDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
