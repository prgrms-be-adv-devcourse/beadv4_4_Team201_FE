import { PaginatedResponse } from './api';

/**
 * Product status
 * - PENDING: Awaiting approval
 * - ON_SALE: Currently available for sale
 * - REJECTED: Not approved
 * - DISCONTINUED: No longer available
 */
export type ProductStatus = 'PENDING' | 'ON_SALE' | 'REJECTED' | 'DISCONTINUED';

/**
 * Product sort options
 */
export type ProductSort = 'RELEVANCE' | 'LATEST' | 'PRICE_ASC' | 'PRICE_DESC';

/**
 * Basic product information
 */
export interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    status: ProductStatus;
    brandName?: string;
    isSoldout?: boolean;
    isActive?: boolean;
}

/**
 * Detailed product information including seller, description, and stats
 */
export interface ProductDetail extends Product {
    sellerId: string;
    description: string;
    images: string[];
    stock: number;
    category: string;
    rating: number;
    reviewCount: number;
    salesCount: number;
    createdAt: string;
}

/**
 * Paginated list of products
 */
export type ProductListResponse = PaginatedResponse<Product>;

/**
 * Query parameters for product list
 */
export interface ProductQueryParams {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: ProductSort;
    page?: number;
    size?: number;
}

/**
 * Query parameters for product search
 */
export interface ProductSearchParams {
    q: string;
    category?: string;
    sort?: ProductSort;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
}

/**
 * Response for popular products
 */
export interface PopularProductsResponse {
    items: Product[];
}
