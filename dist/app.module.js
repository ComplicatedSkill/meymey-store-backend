"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const supabase_module_1 = require("./supabase/supabase.module");
const categories_module_1 = require("./categories/categories.module");
const uom_module_1 = require("./uom/uom.module");
const products_module_1 = require("./products/products.module");
const product_variants_module_1 = require("./product-variants/product-variants.module");
const stock_movements_module_1 = require("./stock-movements/stock-movements.module");
const purchase_orders_module_1 = require("./purchase-orders/purchase-orders.module");
const purchase_inventory_module_1 = require("./purchase-inventory/purchase-inventory.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const stock_adjustments_module_1 = require("./stock-adjustments/stock-adjustments.module");
const stores_module_1 = require("./stores/stores.module");
const customers_module_1 = require("./customers/customers.module");
const sales_orders_module_1 = require("./sales-orders/sales-orders.module");
const invoices_module_1 = require("./invoices/invoices.module");
const payment_methods_module_1 = require("./payment-methods/payment-methods.module");
const exchange_rates_module_1 = require("./exchange-rates/exchange-rates.module");
const notifications_module_1 = require("./notifications/notifications.module");
const stock_batches_module_1 = require("./stock-batches/stock-batches.module");
const reports_module_1 = require("./reports/reports.module");
const storefront_module_1 = require("./storefront/storefront.module");
const upload_module_1 = require("./upload/upload.module");
const brands_module_1 = require("./brands/brands.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const payments_module_1 = require("./payments/payments.module");
const product_packages_module_1 = require("./product-packages/product-packages.module");
const product_uom_conversions_module_1 = require("./product-uom-conversions/product-uom-conversions.module");
const income_module_1 = require("./income/income.module");
const expenses_module_1 = require("./expenses/expenses.module");
const assets_module_1 = require("./assets/assets.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            supabase_module_1.SupabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            categories_module_1.CategoriesModule,
            uom_module_1.UomModule,
            products_module_1.ProductsModule,
            product_variants_module_1.ProductVariantsModule,
            stock_movements_module_1.StockMovementsModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            purchase_inventory_module_1.PurchaseInventoryModule,
            suppliers_module_1.SuppliersModule,
            stock_adjustments_module_1.StockAdjustmentsModule,
            stores_module_1.StoresModule,
            customers_module_1.CustomersModule,
            sales_orders_module_1.SalesOrdersModule,
            invoices_module_1.InvoicesModule,
            payment_methods_module_1.PaymentMethodsModule,
            exchange_rates_module_1.ExchangeRatesModule,
            notifications_module_1.NotificationsModule,
            stock_batches_module_1.StockBatchesModule,
            reports_module_1.ReportsModule,
            storefront_module_1.StorefrontModule,
            upload_module_1.UploadModule,
            brands_module_1.BrandsModule,
            webhooks_module_1.WebhooksModule,
            payments_module_1.PaymentsModule,
            product_packages_module_1.ProductPackagesModule,
            product_uom_conversions_module_1.ProductUomConversionsModule,
            income_module_1.IncomeModule,
            expenses_module_1.ExpensesModule,
            assets_module_1.AssetsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map