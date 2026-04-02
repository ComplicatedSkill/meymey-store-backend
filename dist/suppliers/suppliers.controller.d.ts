import { SuppliersService, CreateSupplierDto, UpdateSupplierDto } from './suppliers.service';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    create(createSupplierDto: CreateSupplierDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
