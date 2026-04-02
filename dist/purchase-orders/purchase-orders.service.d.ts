import { SupabaseService } from '../supabase/supabase.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
export declare class PurchaseOrdersService {
    private supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
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
