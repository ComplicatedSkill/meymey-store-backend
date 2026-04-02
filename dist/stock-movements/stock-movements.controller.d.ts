import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
export declare class StockMovementsController {
    private readonly service;
    constructor(service: StockMovementsService);
    create(createDto: CreateStockMovementDto, req: any): Promise<any>;
    findAll(req: any, productId?: string): Promise<any[]>;
    getStockLevel(productId: string, req: any, variantId?: string): Promise<{
        product_id: string;
        variant_id: string | undefined;
        stock_level: any;
    }>;
    findOne(id: string, req: any): Promise<any>;
    update(id: string, updateDto: UpdateStockMovementDto, req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
