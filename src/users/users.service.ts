import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async findOne(id: string): Promise<User | null> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .auth.admin.getUserById(id);

    if (error || !data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email || '',
      created_at: data.user.created_at,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll();
    return users.find((u) => u.email === email) || null;
  }

  async findAll(): Promise<User[]> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .auth.admin.listUsers();

    if (error) throw error;

    return data.users.map((user) => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
    }));
  }

  async create(createDto: any): Promise<User> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .auth.admin.createUser({
        email: createDto.email,
        password: createDto.password,
        email_confirm: true,
      });

    if (error) throw error;

    return {
      id: data.user.id,
      email: data.user.email || '',
      created_at: data.user.created_at,
    };
  }

  async update(id: string, updateDto: any): Promise<User> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .auth.admin.updateUserById(id, {
        email: updateDto.email,
        password: updateDto.password,
      });

    if (error) throw error;

    return {
      id: data.user.id,
      email: data.user.email || '',
      created_at: data.user.created_at,
    };
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .auth.admin.deleteUser(id);

    if (error) throw error;
    return { message: 'User deleted successfully' };
  }

  async saveDeviceToken(userId: string, token: string, deviceType?: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('user_device_tokens')
      .upsert(
        {
          user_id: userId,
          token: token,
          device_type: deviceType,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,token' },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
