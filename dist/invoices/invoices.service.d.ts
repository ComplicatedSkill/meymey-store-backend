import { SupabaseService } from '../supabase/supabase.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
export declare class InvoicesService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    private generateInvoiceNumber;
    create(createDto: CreateInvoiceDto, storeId: string): Promise<any>;
    createFromSalesOrder(salesOrderId: string, storeId: string): Promise<any>;
    findAll(storeId: string): Promise<any[]>;
    findOne(id: string, storeId: string): Promise<any>;
    update(id: string, updateDto: UpdateInvoiceDto, storeId: string): Promise<any>;
    recordPayment(id: string, paymentDto: RecordPaymentDto, storeId: string): Promise<any>;
    remove(id: string, storeId: string): Promise<{
        message: string;
    }>;
}
