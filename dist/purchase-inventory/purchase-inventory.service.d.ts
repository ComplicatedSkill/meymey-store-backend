import { SupabaseService } from '../supabase/supabase.service';
import { CreatePurchaseInventoryDto } from './dto/create-purchase-inventory.dto';
import { UpdatePurchaseInventoryDto } from './dto/update-purchase-inventory.dto';
export declare class PurchaseInventoryService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createDto: CreatePurchaseInventoryDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByPurchaseOrder(purchaseOrderId: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdatePurchaseInventoryDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
