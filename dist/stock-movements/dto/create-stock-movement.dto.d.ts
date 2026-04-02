export declare class CreateStockMovementDto {
    product_id: string;
    variant_id?: string;
    quantity: number;
    type: 'in' | 'out' | 'adjustment';
    reference?: string;
    notes?: string;
}
