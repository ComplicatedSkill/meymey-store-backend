import { SalesOrderItemDto } from './sales-order-item.dto';
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
    delivery_info?: DeliveryInfoDto;
}
