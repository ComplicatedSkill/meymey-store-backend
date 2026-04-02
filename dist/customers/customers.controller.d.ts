import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
