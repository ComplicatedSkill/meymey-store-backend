import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async signUp(signUpDto: SignUpDto) {
    const {
      email,
      password,
      store_name,
      store_category,
      username,
      phone_number,
      products_sold,
      address,
      city,
      state,
      country,
      postal_code,
      secondary_phone,
      whatsapp_number,
      logo_url,
      description,
      instagram,
      twitter,
      website,
    } = signUpDto;

    // Check if username already exists
    const { data: existingStore } = await this.supabaseService
      .getClient()
      .from('stores')
      .select('id')
      .eq('username', username)
      .single();

    if (existingStore) {
      throw new BadRequestException('Username already taken');
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await this.supabaseService
      .getAdminClient()
      .auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      throw new UnauthorizedException(authError.message);
    }

    // Create store profile
    const { data: storeData, error: storeError } = await this.supabaseService
      .getClient()
      .from('stores')
      .insert({
        user_id: authData.user.id,
        store_name,
        store_category,
        username,
        phone_number,
        products_sold,
        address,
        city,
        state,
        country,
        postal_code,
        secondary_phone,
        whatsapp_number,
        logo_url,
        description,
        instagram,
        twitter,
        website,
      })
      .select()
      .single();

    if (storeError) {
      // Rollback: delete the created user if store creation fails
      await this.supabaseService
        .getAdminClient()
        .auth.admin.deleteUser(authData.user.id);
      throw new BadRequestException(
        'Failed to create store profile: ' + storeError.message,
      );
    }

    return {
      user: authData.user,
      store: storeData,
    };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    // Fetch the user's store
    const { data: storeData } = await this.supabaseService
      .getClient()
      .from('stores')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    return {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: data.user,
      store: storeData || null,
    };
  }

  async getUser(accessToken: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(accessToken);

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return data.user;
  }
}
