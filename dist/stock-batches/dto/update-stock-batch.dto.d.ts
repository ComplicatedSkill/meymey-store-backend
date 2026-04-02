import { CreateStockBatchDto } from './create-stock-batch.dto';
declare const UpdateStockBatchDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateStockBatchDto>>;
export declare class UpdateStockBatchDto extends UpdateStockBatchDto_base {
    quantity_remaining?: number;
}
export {};
