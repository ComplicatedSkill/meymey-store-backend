import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
export declare class SalesOrdersController {
    private readonly salesOrdersService;
    constructor(salesOrdersService: SalesOrdersService);
    create(createSalesOrderDto: CreateSalesOrderDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSalesOrderDto: UpdateSalesOrderDto): Promise<any>;
    updateStatus(id: string, status: string): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
