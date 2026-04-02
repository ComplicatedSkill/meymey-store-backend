import { StorefrontService } from './storefront.service';
export declare class StorefrontController {
    private readonly storefrontService;
    constructor(storefrontService: StorefrontService);
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
    getProducts(brandId?: string): Promise<any[]>;
    getProduct(productId: string): Promise<any>;
    getCategories(): Promise<any[]>;
    placeOrder(body: any): Promise<{
        order_id: any;
        total_amount: number;
        status: string;
    }>;
}
