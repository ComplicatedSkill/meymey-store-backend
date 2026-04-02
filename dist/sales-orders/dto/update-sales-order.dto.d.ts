import { CreateSalesOrderDto } from './create-sales-order.dto';
declare const UpdateSalesOrderDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateSalesOrderDto>>;
export declare class UpdateSalesOrderDto extends UpdateSalesOrderDto_base {
    status?: 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
}
export {};
