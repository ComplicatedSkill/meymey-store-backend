import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Public client (for user operations)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Admin client (for server-side operations)
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    mimeType: string,
  ) {
    await this.ensureBucketExists(bucket);

    const { data, error } = await this.supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = this.supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }

  private async ensureBucketExists(bucket: string) {
    const { data: buckets, error: listError } =
      await this.supabaseAdmin.storage.listBuckets();

    if (listError) {
      throw listError;
    }

    const exists = buckets.some((b) => b.name === bucket);

    if (!exists) {
      const { error: createError } =
        await this.supabaseAdmin.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 5242880, // 5MB limit
        });

      if (createError) {
        throw createError;
      }
    }
  }
}
