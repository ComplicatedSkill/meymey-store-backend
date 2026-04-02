import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private configService;
    private supabase;
    private supabaseAdmin;
    constructor(configService: ConfigService);
    getClient(): SupabaseClient;
    getAdminClient(): SupabaseClient;
    uploadFile(bucket: string, path: string, file: Buffer, mimeType: string): Promise<string>;
    private ensureBucketExists;
}
