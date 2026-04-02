export declare class CreateStockAdjustmentDto {
    product_id: string;
    variant_id?: string;
    adjustment_type: 'increase' | 'decrease' | 'correction';
    quantity: number;
    reason?: string;
    adjusted_by?: string;
    store_id?: string;
}
