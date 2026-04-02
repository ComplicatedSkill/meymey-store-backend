import { SupabaseService } from '../supabase/supabase.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
export declare class StockMovementsService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createDto: CreateStockMovementDto, storeId: string): Promise<any>;
    findAll(storeId: string): Promise<any[]>;
    findByProduct(productId: string, storeId: string): Promise<any[]>;
    findOne(id: string, storeId: string): Promise<any>;
    update(id: string, updateDto: UpdateStockMovementDto, storeId: string): Promise<any>;
    remove(id: string, storeId: string): Promise<{
        message: string;
    }>;
    getStockLevel(productId: string, storeId: string, variantId?: string): Promise<{
        product_id: string;
        variant_id: string | undefined;
        stock_level: any;
    }>;
}
