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

  async getSummaryReport(storeId: string) {
    let salesQuery = this.supabaseService
      .getClient()
      .from('sales_orders')
      .select('total_amount', { count: 'exact', head: false })
      .filter('status', 'ilike', 'completed');

    let purchaseQuery = this.supabaseService
      .getClient()
      .from('purchase_orders')
      .select('total_amount', { count: 'exact', head: false })
      .eq('status', 'RECEIVED');

    let productQuery = this.supabaseService
      .getClient()
      .from('products')
      .select(
        'id, name, price, cost, reorder_level, stock:stock_batches(quantity_remaining)',
      );

    let productCountQuery = this.supabaseService
      .getClient()
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (storeId) {
      salesQuery = salesQuery.eq('store_id', storeId);
      purchaseQuery = purchaseQuery.eq('store_id', storeId);
      productQuery = productQuery.eq('store_id', storeId);
      productCountQuery = productCountQuery.eq('store_id', storeId);
    }

    const [
      { data: salesData },
      { data: purchaseData },
      { data: productData },
      { count: totalProducts },
    ] = await Promise.all([
      salesQuery,
      purchaseQuery,
      productQuery,
      productCountQuery,
    ]);

    const totalSales =
      salesData?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;

    const totalPurchases =
      purchaseData?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) ||
      0;

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
      productCount: totalProducts ?? 0,
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
      .getAdminClient()
      .from('sales_orders')
      .select(
        '*, customer:customers(id, name), items:sales_order_items(quantity, total, unit_price, costs:sales_order_item_costs(quantity, unit_cost))',
      )
      .filter('status', 'ilike', 'completed');
    if (startDate) query = query.gte('order_date', startDate);
    if (endDate) query = query.lte('order_date', endDate);
    const { data, error } = await query.order('order_date', {
      ascending: false,
    });
    if (error) throw error;

    return data?.map((o: any) => {
      let cogs = 0;
      o.items?.forEach((item: any) => {
        if (item.costs && item.costs.length > 0) {
          item.costs.forEach((cost: any) => {
            cogs += Number(cost.quantity) * Number(cost.unit_cost);
          });
        }
      });
      const revenue = Number(o.subtotal ?? o.total_amount ?? 0);
      const profit = revenue - cogs;
      const profitMargin = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;
      const date = o.order_date
        ? o.order_date.slice(0, 10)
        : o.created_at?.slice(0, 10);

      return {
        id: o.id,
        order_number: o.order_number,
        date,
        customer: o.customer ? { id: o.customer.id, name: o.customer.name } : null,
        revenue,
        cogs: Number(cogs.toFixed(4)),
        profit: Number(profit.toFixed(4)),
        profit_margin: profitMargin,
        discount: Number(o.discount ?? 0),
        tax: Number(o.tax ?? 0),
        total_amount: Number(o.total_amount ?? 0),
      };
    }) ?? [];
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

  async getMonthlyProfitLoss(storeId: string, year: number, month: number) {
    if (!storeId) return { totalIncome: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0, incomeByCategory: {}, expenseByCategory: {} };
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const [incomeResult, expenseResult] = await Promise.all([
      this.supabaseService
        .getAdminClient()
        .from('income')
        .select('amount, category')
        .eq('store_id', storeId)
        .gte('date', startDate)
        .lte('date', endDate),
      this.supabaseService
        .getAdminClient()
        .from('expenses')
        .select('amount, category')
        .eq('store_id', storeId)
        .gte('date', startDate)
        .lte('date', endDate),
    ]);

    const totalIncome =
      incomeResult.data?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
    const totalExpenses =
      expenseResult.data?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
    const netProfit = totalIncome - totalExpenses;

    const incomeByCategory: Record<string, number> = {};
    incomeResult.data?.forEach((r) => {
      const cat = r.category || 'uncategorized';
      incomeByCategory[cat] = (incomeByCategory[cat] || 0) + Number(r.amount || 0);
    });

    const expenseByCategory: Record<string, number> = {};
    expenseResult.data?.forEach((r) => {
      const cat = r.category || 'uncategorized';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(r.amount || 0);
    });

    return {
      year,
      month,
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin: totalIncome > 0 ? Number(((netProfit / totalIncome) * 100).toFixed(2)) : 0,
      incomeByCategory,
      expenseByCategory,
    };
  }

  async getYearlyProfitLoss(storeId: string, year: number) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    let salesQuery = this.supabaseService
      .getAdminClient()
      .from('sales_orders')
      .select(
        'subtotal, order_date, created_at, items:sales_order_items(costs:sales_order_item_costs(quantity, unit_cost))',
      )
      .filter('status', 'ilike', 'completed')
      .gte('order_date', startDate)
      .lte('order_date', endDate);

    if (storeId) salesQuery = salesQuery.eq('store_id', storeId);

    let expensesQuery = this.supabaseService
      .getAdminClient()
      .from('expenses')
      .select('amount, date')
      .gte('date', startDate)
      .lte('date', endDate);

    if (storeId) expensesQuery = expensesQuery.eq('store_id', storeId);

    const [salesResult, expensesResult] = await Promise.all([
      salesQuery,
      expensesQuery,
    ]);

    const months: Record<number, { revenue: number; cogs: number; expenses: number }> = {};
    for (let m = 1; m <= 12; m++) months[m] = { revenue: 0, cogs: 0, expenses: 0 };

    salesResult.data?.forEach((order: any) => {
      const dateStr = order.order_date || order.created_at?.slice(0, 10);
      if (!dateStr) return;
      const month = parseInt(dateStr.slice(5, 7), 10);
      if (month < 1 || month > 12) return;
      months[month].revenue += Number(order.subtotal || 0);
      order.items?.forEach((item: any) => {
        item.costs?.forEach((cost: any) => {
          months[month].cogs += Number(cost.quantity) * Number(cost.unit_cost);
        });
      });
    });

    expensesResult.data?.forEach((expense: any) => {
      if (!expense.date) return;
      const month = parseInt(expense.date.slice(5, 7), 10);
      if (month < 1 || month > 12) return;
      months[month].expenses += Number(expense.amount || 0);
    });

    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    return Object.entries(months).map(([m, data]) => ({
      month: parseInt(m),
      monthName: MONTH_NAMES[parseInt(m) - 1],
      revenue: Number(data.revenue.toFixed(2)),
      cogs: Number(data.cogs.toFixed(2)),
      expenses: Number(data.expenses.toFixed(2)),
      grossProfit: Number((data.revenue - data.cogs).toFixed(2)),
      netProfit: Number((data.revenue - data.cogs - data.expenses).toFixed(2)),
    }));
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
