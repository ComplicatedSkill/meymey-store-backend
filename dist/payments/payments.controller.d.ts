import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPaymentQr(body: {
        invoiceId: string;
        amount: number;
    }): Promise<any>;
    checkStatus(tranId: string): Promise<any>;
    generateWebsiteQr(body: {
        amount: number;
        customerInfo: any;
    }): Promise<any>;
    checkWebsiteStatus(tranId: string): Promise<any>;
    webhook(payload: any): Promise<{
        status: string;
        message: string;
    } | {
        status: string;
        message?: undefined;
    }>;
    recordManualPayment(body: {
        invoiceId?: string;
        salesOrderId?: string;
        amount: number;
        paymentMethodId: string;
        notes?: string;
    }): Promise<any>;
    getPaymentsByInvoice(invoiceId: string): Promise<any[]>;
}
