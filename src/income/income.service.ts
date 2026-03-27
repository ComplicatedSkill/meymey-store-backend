import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class IncomeService {
  private readonly logger = new Logger(IncomeService.name);

  constructor(private supabaseService: SupabaseService) {}

  private computeOrderProfit(order: any) {
    const revenue = Number(order.subtotal || 0);
    let cogs = 0;
    order.items?.forEach((item: any) => {
      item.costs?.forEach((cost: any) => {
        cogs += Number(cost.quantity) * Number(cost.unit_cost);
      });
    });
    const profit = revenue - cogs;
    const profitMargin = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;
    return { revenue, cogs, profit, profitMargin };
  }

  async findAll(startDate?: string, endDate?: string) {
    let query = this.supabaseService
      .getAdminClient()
      .from('sales_orders')
      .select(
        `id, order_number, subtotal, total_amount, discount, tax, order_date, created_at,
         customer:customers(id, name),
         items:sales_order_items(id, quantity, unit_price, total, costs:sales_order_item_costs(quantity, unit_cost))`,
      )
      .filter('status', 'ilike', 'completed');

    if (startDate) query = query.gte('order_date', startDate);
    if (endDate) query = query.lte('order_date', endDate);

    const { data, error } = await query.order('order_date', { ascending: false });
    if (error) {
      this.logger.error('Find all income error', error);
      throw new InternalServerErrorException(error.message);
    }

    return data?.map((order) => {
      const { revenue, cogs, profit, profitMargin } = this.computeOrderProfit(order);
      return {
        id: order.id,
        order_number: order.order_number,
        date: order.order_date || order.created_at,
        customer: order.customer,
        revenue,
        cogs,
        profit,
        profit_margin: profitMargin,
        discount: Number(order.discount || 0),
        tax: Number(order.tax || 0),
        total_amount: Number(order.total_amount || 0),
      };
    });
  }

  async findOne(id: string) {
    const { data: order, error } = await this.supabaseService
      .getAdminClient()
      .from('sales_orders')
      .select(
        `id, order_number, subtotal, total_amount, discount, tax, order_date, created_at,
         customer:customers(id, name),
         items:sales_order_items(id, quantity, unit_price, total, product:products(id, name, sku), costs:sales_order_item_costs(quantity, unit_cost))`,
      )
      .filter('status', 'ilike', 'completed')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Completed sales order with ID ${id} not found`);

    const { revenue, cogs, profit, profitMargin } = this.computeOrderProfit(order);

    const items = order.items?.map((item: any) => {
      const itemCogs = item.costs?.reduce(
        (sum: number, c: any) => sum + Number(c.quantity) * Number(c.unit_cost),
        0,
      ) || 0;
      return {
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        cogs: itemCogs,
        profit: Number(item.total) - itemCogs,
      };
    });

    return {
      id: order.id,
      order_number: order.order_number,
      date: order.order_date || order.created_at,
      customer: order.customer,
      revenue,
      cogs,
      profit,
      profit_margin: profitMargin,
      discount: Number(order.discount || 0),
      tax: Number(order.tax || 0),
      total_amount: Number(order.total_amount || 0),
      items,
    };
  }

  async getMonthlySummary(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('sales_orders')
      .select(
        `subtotal, order_date, items:sales_order_items(costs:sales_order_item_costs(quantity, unit_cost))`,
      )
      .filter('status', 'ilike', 'completed')
      .gte('order_date', startDate)
      .lte('order_date', endDate);

    if (error) throw new InternalServerErrorException(error.message);

    let totalRevenue = 0;
    let totalCogs = 0;

    data?.forEach((order) => {
      totalRevenue += Number(order.subtotal || 0);
      order.items?.forEach((item: any) => {
        item.costs?.forEach((cost: any) => {
          totalCogs += Number(cost.quantity) * Number(cost.unit_cost);
        });
      });
    });

    const totalProfit = totalRevenue - totalCogs;

    return {
      year,
      month,
      startDate,
      endDate,
      totalRevenue,
      totalCogs,
      totalProfit,
      profitMargin: totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0,
      orderCount: data?.length || 0,
    };
  }
}
