import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(private supabaseService: SupabaseService) {}

  async create(createAssetDto: CreateAssetDto) {
    const payload = {
      ...createAssetDto,
      current_value: createAssetDto.current_value ?? createAssetDto.purchase_price,
      status: createAssetDto.status ?? 'active',
    };

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('assets')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error('Create asset error', error);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async findAll(status?: string) {
    let query = this.supabaseService
      .getAdminClient()
      .from('assets')
      .select('*');

    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('purchase_date', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Asset with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('assets')
      .update(updateAssetDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new NotFoundException(`Asset with ID ${id} not found`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Asset deleted successfully' };
  }

  async getTotalValue() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('assets')
      .select('purchase_price, current_value')
      .eq('status', 'active');

    if (error) throw new InternalServerErrorException(error.message);

    const totalPurchaseValue = data?.reduce((sum, a) => sum + Number(a.purchase_price || 0), 0) || 0;
    const totalCurrentValue = data?.reduce((sum, a) => sum + Number(a.current_value || 0), 0) || 0;

    return {
      totalPurchaseValue,
      totalCurrentValue,
      totalDepreciation: totalPurchaseValue - totalCurrentValue,
      activeCount: data?.length || 0,
    };
  }
}
