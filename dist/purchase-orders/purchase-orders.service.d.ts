import { SupabaseService } from '../supabase/supabase.service';
import { ProductUomConversionsService } from '../product-uom-conversions/product-uom-conversions.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { AccountsPayableService } from '../accounts-payable/accounts-payable.service';
export declare class PurchaseOrdersService {
    private supabaseService;
    private uomConversionsService;
    private accountsPayableService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, uomConversionsService: ProductUomConversionsService, accountsPayableService: AccountsPayableService);
    create(createDto: CreatePurchaseOrderDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdatePurchaseOrderDto): Promise<any>;
    updateStatus(id: string, status: string): Promise<any>;
    private receiveOrder;
    remove(id: string): Promise<{
        message: string;
    }>;
}
