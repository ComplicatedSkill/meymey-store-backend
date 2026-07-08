import { SalesOrderItemDto } from './sales-order-item.dto';
export declare class AdditionalChargeDto {
    id: string;
    label: string;
    amount: number;
}
export declare class DeliveryInfoDto {
    address?: string;
    phone?: string;
    recipientName?: string;
    notes?: string;
    trackingNumber?: string;
}
export declare class CreateSalesOrderDto {
    customer_id?: string;
    items: SalesOrderItemDto[];
    tax?: number;
    discount?: number;
    notes?: string;
    order_date?: string;
    status?: string;
    sale_type?: string;
    payment_type?: 'AR' | 'COMPLETE';
    payment_method_id?: string;
    delivery_info?: DeliveryInfoDto;
    additional_charges?: AdditionalChargeDto[];
}
