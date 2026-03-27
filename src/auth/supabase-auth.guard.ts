import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid token');
      }

      const requestedStoreId = request.headers['x-store-id'];

      // Fetch store profile — use admin client to bypass RLS
      let storeQuery = this.supabaseService
        .getAdminClient()
        .from('stores')
        .select('*')
        .eq('user_id', data.user.id);

      if (requestedStoreId) {
        storeQuery = storeQuery.eq('id', requestedStoreId);
      }

      const { data: storeData, error: storeError } = await storeQuery;

      if (storeError) {
        throw new UnauthorizedException('Error fetching store information');
      }

      // If requestedStoreId was provided but not found, throw error
      if (requestedStoreId && (!storeData || storeData.length === 0)) {
        throw new UnauthorizedException(
          'Requested store not found or access denied',
        );
      }

      // Use the first store found (either the requested one or the user's default/first)
      const selectedStore =
        storeData && storeData.length > 0 ? storeData[0] : null;

      // Attach user and store to request object
      request.user = {
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        store: selectedStore,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
