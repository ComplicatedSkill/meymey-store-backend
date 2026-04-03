import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { ProductPackagesService } from '../product-packages/product-packages.service';
import { ProductUomConversionsService } from '../product-uom-conversions/product-uom-conversions.service';
export declare class SalesOrdersService {
    private supabaseService;
    private notificationsService;
    private productPackagesService;
    private uomConversionsService;
    constructor(supabaseService: SupabaseService, notificationsService: NotificationsService, productPackagesService: ProductPackagesService, uomConversionsService: ProductUomConversionsService);
    private generateOrderNumber;
    private calculateItemTotal;
    private calculateOrderTotals;
    create(createDto: CreateSalesOrderDto, storeId?: string): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdateSalesOrderDto): Promise<any>;
    private restoreStock;
    updateStatus(id: string, status: string): Promise<any>;
    private deductStock;
    private allocateFIFO;
    private checkStockAvailability;
    private checkPackageStockAvailability;
    remove(id: string): Promise<{
        message: string;
    }>;
}
