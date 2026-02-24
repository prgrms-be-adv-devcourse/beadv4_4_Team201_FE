import { PaginatedResponse } from './api';

/**
 * Product status
 * - PENDING: Awaiting approval
 * - ON_SALE: Currently available for sale
 * - REJECTED: Not approved
 * - DISCONTINUED: No longer available
 */
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ON_SALE' | 'REJECTED' | 'DISCONTINUED';

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

/**
 * 판매자 본인 상품 (MyProductDto)
 */
export interface MyProduct {
    id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    imageKey?: string;
    status: 'DRAFT' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

export interface MyProductPage {
    content: MyProduct[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isFirst: boolean;
    isLast: boolean;
}

/**
 * 상품 등록 요청 (ProductCreateRequestDto)
 */
export interface ProductCreateRequest {
    name: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    imageKey?: string;
}

/**
 * 상품 수정 요청 (ProductUpdateRequestDto)
 */
export interface ProductUpdateRequest {
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    stock?: number;
    imageKey?: string;
    expectedStock?: number;  // 수정 화면 진입 시점의 재고량 (낙관적 동시성 제어)
    status?: 'DRAFT' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
}

/**
 * 재고 이력 항목 (StockHistoryDto)
 */
export interface StockHistory {
    id: number;
    productId: number;
    changeType: 'MANUAL_SYSTEM' | 'MANUAL_SELLER' | 'ORDER_COMPLETED' | 'ORDER_REFUNDED';
    delta: number;
    beforeStock: number;
    afterStock: number;
    createdAt: string;
}

/**
 * 재고 이력 검색 파라미터 (StockHistorySearchDto)
 */
export interface StockHistorySearchParams {
    productId?: number;
    changeType?: 'MANUAL_SYSTEM' | 'MANUAL_SELLER' | 'ORDER_COMPLETED' | 'ORDER_REFUNDED';
    fromDate?: string;
    toDate?: string;
    sort?: string;
    page?: number;
    size?: number;
}

/**
 * 재고 이력 페이지 응답
 */
export interface StockHistoryPage {
    content: StockHistory[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isFirst: boolean;
    isLast: boolean;
}
