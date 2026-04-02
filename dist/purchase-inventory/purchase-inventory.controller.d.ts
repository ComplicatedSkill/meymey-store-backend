import { PurchaseInventoryService } from './purchase-inventory.service';
import { CreatePurchaseInventoryDto } from './dto/create-purchase-inventory.dto';
import { UpdatePurchaseInventoryDto } from './dto/update-purchase-inventory.dto';
export declare class PurchaseInventoryController {
    private readonly service;
    constructor(service: PurchaseInventoryService);
    create(createDto: CreatePurchaseInventoryDto): Promise<any>;
    findAll(purchaseOrderId?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdatePurchaseInventoryDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
