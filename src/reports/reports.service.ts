import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ReportsService {
  constructor(private supabaseService: SupabaseService) {}

  async getProfitReport(startDate?: string, endDate?: string) {
    let query = this.supabaseService
      .getClient()
      .from('sales_orders')
      .select(
        `id, total_amount, subtotal, discount, tax, order_date, created_at, items:sales_order_items(id, total, quantity, unit_price, costs:sales_order_item_costs(quantity, unit_cost))`,
      )
      .filter('status', 'ilike', 'completed');

    if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`);
    if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`);

    const { data: orders, error } = await query.order('created_at', {
      ascending: false,
    });
    if (error) throw error;

    let totalRevenue = 0;
    let totalCOGS = 0;
    orders?.forEach((order) => {
      totalRevenue += Number(order.subtotal || 0);
      order.items?.forEach((item: any) => {
        item.costs?.forEach((cost: any) => {
          totalCOGS += Number(cost.quantity) * Number(cost.unit_cost);
        });
      });
    });

    const netProfit = totalRevenue - totalCOGS;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      summary: {
        totalRevenue,
        totalCOGS,
        netProfit,
        profitMargin: Number(profitMargin.toFixed(2)),
        orderCount: orders?.length || 0,
      },
      orders: orders?.map((o) => {
        let orderCOGS = 0;
        o.items?.forEach((item: any) => {
          item.costs?.forEach((cost: any) => {
            orderCOGS += Number(cost.quantity) * Number(cost.unit_cost);
          });
        });
        return {
          id: o.id,
          order_date: o.order_date || o.created_at,
          revenue: o.subtotal,
          cogs: orderCOGS,
          profit: Number(o.subtotal) - orderCOGS,
        };
      }),
    };
  }

  async getSummaryReport() {
    const { data: salesData } = await this.supabaseService
      .getClient()
      .from('sales_orders')
      .select('total_amount, status')
      .filter('status', 'ilike', 'completed');
    const totalSales =
      salesData?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;

    const { data: purchaseData } = await this.supabaseService
      .getClient()
      .from('purchase_orders')
      .select('total_amount')
      .eq('status', 'RECEIVED');
    const totalPurchases =
      purchaseData?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) ||
      0;

    const { data: productData } = await this.supabaseService
      .getClient()
      .from('products')
      .select(
        'id, name, price, cost, reorder_level, stock:stock_batches(quantity_remaining)',
      );
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    productData?.forEach((p) => {
      const stock =
        p.stock?.reduce((sum, b) => sum + (b.quantity_remaining || 0), 0) || 0;
      totalInventoryValue += stock * Number(p.cost || 0);
      if (stock <= (p.reorder_level || 0)) lowStockCount++;
    });

    return {
      totalSales,
      totalPurchases,
      totalInventoryValue,
      lowStockCount,
      productCount: productData?.length || 0,
    };
  }

  async getPurchaseReport(startDate?: string, endDate?: string) {
    let query = this.supabaseService
      .getClient()
      .from('purchase_orders')
      .select('*, supplier:suppliers(name)');
    if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`);
    if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`);
    const { data, error } = await query.order('created_at', {
      ascending: false,
    });
    if (error) throw error;
    return data;
  }

  async getInventoryReport() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select(
        'id, name, sku, reorder_level, category:categories(name), uom:uom(abbreviation), stock:stock_batches(quantity_remaining)',
      );
    if (error) throw error;
    return data.map((p) => {
      const stock =
        p.stock?.reduce((sum, b) => sum + (b.quantity_remaining || 0), 0) || 0;
      return {
        ...p,
        stock_level: stock,
        is_low_stock: stock <= (p.reorder_level || 0),
      };
    });
  }

  async getSalesReport(startDate?: string, endDate?: string) {
    let query = this.supabaseService
      .getClient()
      .from('sales_orders')
      .select('*, customer:customers(name)')
      .filter('status', 'ilike', 'completed');
    if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`);
    if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`);
    const { data, error } = await query.order('created_at', {
      ascending: false,
    });
    if (error) throw error;
    return data;
  }

  async getSalesByCustomerReport() {
    const { data: sales, error } = await this.supabaseService
      .getClient()
      .from('sales_orders')
      .select('total_amount, customer:customers(name)')
      .filter('status', 'ilike', 'completed');
    if (error) throw error;
    const customerSales: Record<string, number> = {};
    sales?.forEach((s: any) => {
      const name = s.customer?.name || 'Walk-in Customer';
      customerSales[name] = (customerSales[name] || 0) + Number(s.total_amount);
    });
    return Object.entries(customerSales)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }

  async getSalesByProductReport(startDate?: string, endDate?: string) {
    let query = this.supabaseService
      .getClient()
      .from('sales_order_items')
      .select(
        `quantity, total, unit_price, product:products(id, name, sku), sales_order:sales_orders!inner(id, status, created_at)`,
      )
      .filter('sales_order.status', 'ilike', 'completed');
    if (startDate)
      query = query.gte('sales_order.created_at', `${startDate}T00:00:00`);
    if (endDate)
      query = query.lte('sales_order.created_at', `${endDate}T23:59:59`);
    const { data: items, error } = await query;
    if (error) throw error;

    const productSales: Record<
      string,
      { name: string; sku: string; quantity: number; revenue: number }
    > = {};
    items?.forEach((item: any) => {
      const productId = item.product?.id;
      if (!productId) return;
      if (!productSales[productId])
        productSales[productId] = {
          name: item.product.name,
          sku: item.product.sku,
          quantity: 0,
          revenue: 0,
        };
      productSales[productId].quantity += Number(item.quantity || 0);
      productSales[productId].revenue += Number(item.total || 0);
    });
    return Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  async getProductSuppliersReport() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('purchase_inventory')
      .select(
        `product_id, product:products(name, sku), purchase_order:purchase_orders!inner(supplier:suppliers(id, name))`,
      );
    if (error) throw error;

    const productSuppliers: Record<
      string,
      {
        name: string;
        sku: string;
        suppliers: Set<string>;
        supplierDetails: { id: string; name: string }[];
      }
    > = {};
    data?.forEach((item: any) => {
      const productId = item.product_id;
      const supplier = item.purchase_order?.supplier;
      if (!productId || !supplier) return;
      if (!productSuppliers[productId])
        productSuppliers[productId] = {
          name: item.product.name,
          sku: item.product.sku,
          suppliers: new Set(),
          supplierDetails: [],
        };
      if (!productSuppliers[productId].suppliers.has(supplier.id)) {
        productSuppliers[productId].suppliers.add(supplier.id);
        productSuppliers[productId].supplierDetails.push(supplier);
      }
    });
    return Object.entries(productSuppliers)
      .map(([id, data]) => ({
        id,
        name: data.name,
        sku: data.sku,
        suppliers: data.supplierDetails,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
