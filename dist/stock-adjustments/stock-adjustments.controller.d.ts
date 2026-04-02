import { StockAdjustmentsService, CreateStockAdjustmentDto } from './stock-adjustments.service';
export declare class StockAdjustmentsController {
    private readonly stockAdjustmentsService;
    constructor(stockAdjustmentsService: StockAdjustmentsService);
    create(createDto: CreateStockAdjustmentDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByProduct(productId: string): Promise<any[]>;
}
