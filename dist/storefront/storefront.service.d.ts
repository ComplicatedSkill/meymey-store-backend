import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class StorefrontService {
    private supabaseService;
    private notificationsService;
    constructor(supabaseService: SupabaseService, notificationsService: NotificationsService);
    private getSingleStoreId;
    getStores(): Promise<any[]>;
    getStore(): Promise<any>;
    getProducts(params?: {
        brandId?: string;
    }): Promise<any[]>;
    getProduct(productId: string): Promise<any>;
    getCategories(): Promise<any[]>;
    placeOrder(orderDto: any): Promise<{
        order_id: any;
        total_amount: number;
        status: string;
    }>;
    getHomepage(): Promise<{
        featuredProducts: {
            id: any;
            name: any;
            slug: string;
            brand: any;
            brand_id: any;
            category: any;
            category_id: any;
            price: any;
            originalPrice: any;
            description: any;
            images: string[];
            rating: null;
            reviewCount: null;
            badge: null;
            inStock: boolean;
            stock_level: any;
            skinType: null;
            volume: null;
            sku: any;
        }[];
        categories: {
            id: any;
            name: any;
            slug: string;
            description: any;
            icon: any;
            products: {
                id: any;
                name: any;
                slug: string;
                brand: any;
                brand_id: any;
                category: any;
                category_id: any;
                price: any;
                originalPrice: any;
                description: any;
                images: string[];
                rating: null;
                reviewCount: null;
                badge: null;
                inStock: boolean;
                stock_level: any;
                skinType: null;
                volume: null;
                sku: any;
            }[];
        }[];
        brands: {
            id: any;
            name: any;
            slug: string;
            country: any;
            description: any;
            icon: any;
        }[];
    }>;
}
