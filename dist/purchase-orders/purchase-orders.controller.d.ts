import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
export declare class PurchaseOrdersController {
    private readonly service;
    constructor(service: PurchaseOrdersService);
    create(createDto: CreatePurchaseOrderDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdatePurchaseOrderDto): Promise<any>;
    updateStatus(id: string, status: string): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
