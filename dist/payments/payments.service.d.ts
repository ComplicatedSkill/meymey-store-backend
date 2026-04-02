import { SupabaseService } from '../supabase/supabase.service';
import { InvoicesService } from '../invoices/invoices.service';
import { ConfigService } from '@nestjs/config';
export declare class PaymentsService {
    private supabaseService;
    private invoicesService;
    private configService;
    constructor(supabaseService: SupabaseService, invoicesService: InvoicesService, configService: ConfigService);
    private getAbaConfig;
    private buildQrPayload;
    private verifyWebhookHash;
    createPaymentQr(invoiceId: string, amount: number): Promise<any>;
    generateWebsiteQr(amount: number, customerInfo: any): Promise<any>;
    checkTransaction(tranId: string): Promise<any>;
    private markPaymentCompleted;
    recordManualPayment(data: {
        invoiceId?: string;
        salesOrderId?: string;
        amount: number;
        paymentMethodId: string;
        notes?: string;
    }): Promise<any>;
    findByInvoice(invoiceId: string): Promise<any[]>;
    handleWebhook(payload: any): Promise<{
        status: string;
        message: string;
    } | {
        status: string;
        message?: undefined;
    }>;
}
