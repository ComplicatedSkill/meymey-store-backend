import { SupabaseService } from '../supabase/supabase.service';
import { StockBatchesService } from '../stock-batches/stock-batches.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
export { CreateStockAdjustmentDto };
export declare class StockAdjustmentsService {
    private supabaseService;
    private stockBatchesService;
    constructor(supabaseService: SupabaseService, stockBatchesService: StockBatchesService);
    create(createDto: CreateStockAdjustmentDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByProduct(productId: string): Promise<any[]>;
}
