import { SupabaseService } from '../supabase/supabase.service';
import { CreateStockBatchDto } from './dto/create-stock-batch.dto';
export interface FIFOAllocation {
    batch_id: string;
    quantity: number;
    unit_cost: number;
}
export declare class StockBatchesService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    private generateBatchNumber;
    create(createDto: CreateStockBatchDto, storeId: string): Promise<any>;
    findAll(storeId: string): Promise<any[]>;
    findByProduct(productId: string, storeId: string, variantId?: string): Promise<any[]>;
    findOne(id: string, storeId: string): Promise<any>;
    getAvailableStock(productId: string, storeId: string, variantId?: string): Promise<{
        product_id: string;
        variant_id: string | undefined;
        available_stock: any;
    }>;
    allocateFIFO(productId: string, variantId: string | null, quantity: number, storeId: string): Promise<FIFOAllocation[]>;
    returnStock(productId: string, variantId: string | null, quantity: number, storeId: string, unitCost?: number): Promise<any>;
    remove(id: string, storeId: string): Promise<{
        message: string;
    }>;
}
