import { StockBatchesService } from './stock-batches.service';
import { CreateStockBatchDto } from './dto/create-stock-batch.dto';
export declare class StockBatchesController {
    private readonly stockBatchesService;
    constructor(stockBatchesService: StockBatchesService);
    create(createDto: CreateStockBatchDto, req: any): Promise<any>;
    findAll(req: any): Promise<any[]>;
    findByProduct(productId: string, variantId: string, req: any): Promise<any[]>;
    getAvailableStock(productId: string, variantId: string, req: any): Promise<{
        product_id: string;
        variant_id: string | undefined;
        available_stock: any;
    }>;
    findOne(id: string, req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
