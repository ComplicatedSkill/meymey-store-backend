import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(createInvoiceDto: CreateInvoiceDto, req: any): Promise<any>;
    createFromSalesOrder(orderId: string, req: any): Promise<any>;
    findAll(req: any): Promise<any[]>;
    findOne(id: string, req: any): Promise<any>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto, req: any): Promise<any>;
    recordPayment(id: string, recordPaymentDto: RecordPaymentDto, req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
