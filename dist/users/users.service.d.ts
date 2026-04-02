import { SupabaseService } from '../supabase/supabase.service';
export interface User {
    id: string;
    email: string;
    created_at: string;
}
export declare class UsersService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    findOne(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    create(createDto: any): Promise<User>;
    update(id: string, updateDto: any): Promise<User>;
    remove(id: string): Promise<{
        message: string;
    }>;
    saveDeviceToken(userId: string, token: string, deviceType?: string): Promise<any>;
}
