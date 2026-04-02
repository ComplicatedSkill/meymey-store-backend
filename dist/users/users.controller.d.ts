import { UsersService } from './users.service';
import { SaveDeviceTokenDto } from './dto/save-device-token.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    saveDeviceToken(req: any, dto: SaveDeviceTokenDto): Promise<any>;
    findAll(): Promise<import("./users.service").User[]>;
    findOne(id: string): Promise<import("./users.service").User | null>;
    create(createDto: any): Promise<import("./users.service").User>;
    update(id: string, updateDto: any): Promise<import("./users.service").User>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
