import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
export declare class ProductVariantsService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createDto: CreateProductVariantDto, storeId: string): Promise<any>;
    findAll(storeId: string): Promise<any[]>;
    findByProduct(productId: string, storeId: string): Promise<any[]>;
    findOne(id: string, storeId: string): Promise<any>;
    update(id: string, updateDto: UpdateProductVariantDto, storeId: string): Promise<any>;
    remove(id: string, storeId: string): Promise<{
        message: string;
    }>;
}
