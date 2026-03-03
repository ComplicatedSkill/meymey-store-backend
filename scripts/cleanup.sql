-- Database Cleanup Script for BongStock
-- Run this in the Supabase SQL Editor to remove all application data while keeping the schema intact.

-- Disable triggers temporarily to avoid issues during truncation
SET session_replication_role = 'replica';

-- Truncate all application tables using CASCADE to handle foreign key dependencies
TRUNCATE TABLE 
    public.sales_order_items,
    public.sales_orders,
    public.purchase_inventory,
    public.purchase_orders,
    public.stock_movements,
    public.stock_adjustments,
    public.stock_batches,
    public.product_variants,
    public.products,
    public.categories,
    public.uom,
    public.customers,
    public.suppliers,
    public.payment_methods,
    public.taxes,
    public.exchange_rates,
    public.notifications,
    public.invoices,
    public.stores
RESTART IDENTITY CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Note: This script does NOT delete users from the auth.users table.
-- To delete all users as well, run:
-- DELETE FROM auth.users;
