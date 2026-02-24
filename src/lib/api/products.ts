import { apiClient } from './client';
import { resolveImageUrl } from '@/lib/image';
import type {
  Product,
  ProductDetail,
  ProductListResponse,
  ProductQueryParams,
  ProductSearchParams,
  PopularProductsResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  MyProduct,
  MyProductPage,
  StockHistoryPage,
  StockHistorySearchParams,
} from '@/types/product';

// Alias for backward compatibility
export type ProductsParams = ProductQueryParams;
export type SearchProductsParams = ProductSearchParams;

// 백엔드 API 응답 타입 (PageResponseProductDto)
interface BackendProductResponse {
  content: BackendProduct[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

interface BackendProduct {
  id: number;
  sellerNickName: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageKey?: string;
  isSoldout?: boolean;
  soldout?: boolean;
  isActive?: boolean;
  active?: boolean;
  createdAt: string;
}

// 백엔드 응답을 프론트엔드 타입으로 변환
function mapBackendProduct(product: BackendProduct): Product {
  return {
    id: product.id.toString(),
    name: product.name,
    price: product.price,
    imageUrl: resolveImageUrl(product.imageKey),
    status: 'ON_SALE',
    brandName: product.sellerNickName,
    isSoldout: product.isSoldout ?? product.soldout,
    isActive: product.isActive ?? product.active,
  };
}

function mapBackendResponse(response: BackendProductResponse): ProductListResponse {
  const mappedProducts = response.content
    .filter(product => (product.isActive ?? product.active) !== false)
    .map(mapBackendProduct);
  return {
    content: mappedProducts,
    items: mappedProducts,
    page: {
      page: response.pageNumber,
      size: response.pageSize,
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      hasNext: !response.isLast,
      hasPrevious: !response.isFirst,
    },
  };
}

export async function getProducts(params?: ProductsParams): Promise<ProductListResponse> {
  const queryParams = new URLSearchParams();

  // 백엔드 ES 검색 API에 맞게 파라미터 매핑
  if (params?.category) queryParams.append('category', params.category);
  if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/v2/products/search/es?${queryString}` : '/api/v2/products/search/es';

  const response = await apiClient.get<BackendProductResponse>(endpoint);
  return mapBackendResponse(response);
}

export async function searchProducts(params: SearchProductsParams): Promise<ProductListResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('keyword', params.q);
  if (params.category) queryParams.append('category', params.category);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const response = await apiClient.get<BackendProductResponse>(`/api/v2/products/search/es?${queryParams.toString()}`);
  return mapBackendResponse(response);
}

export async function getProduct(productId: string): Promise<ProductDetail> {
  // 백엔드 엔드포인트: /api/v2/products/{id}
  const product = await apiClient.get<BackendProduct>(`/api/v2/products/${productId}`);

  return {
    id: product.id.toString(),
    name: product.name,
    price: product.price,
    imageUrl: resolveImageUrl(product.imageKey),
    status: 'ON_SALE',
    brandName: product.sellerNickName,
    isSoldout: product.isSoldout ?? product.soldout,
    isActive: product.isActive ?? product.active,
    sellerId: '',
    description: product.description,
    images: [],
    stock: 100,
    category: product.category,
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    createdAt: product.createdAt,
  };
}

export async function getPopularProducts(limit?: number): Promise<PopularProductsResponse> {
  // 백엔드에 인기 상품 엔드포인트가 없으므로 ES 검색으로 대체
  const queryParams = new URLSearchParams();
  if (limit !== undefined) queryParams.append('size', limit.toString());
  queryParams.append('sort', 'LATEST');

  const queryString = queryParams.toString();
  const endpoint = `/api/v2/products/search/es?${queryString}`;

  const response = await apiClient.get<BackendProductResponse>(endpoint);
  return {
    items: response.content.map(mapBackendProduct),
  };
}

/**
 * 판매자 본인 등록 상품 목록 조회 (GET /api/v2/products/my)
 * MyProductSearchDto: keyword, minPrice, maxPrice, inStock, status, sort, page, size
 */
export interface SellerProductSearchParams {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  status?: 'DRAFT' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  sort?: string;
  page?: number;
  size?: number;
}

export async function getSellerProducts(params?: SellerProductSearchParams): Promise<MyProductPage> {
  const queryParams = new URLSearchParams();
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/v2/products/my?${queryString}` : '/api/v2/products/my';
  return apiClient.get<MyProductPage>(endpoint);
}

/**
 * 상품 등록 (POST /api/v2/products)
 */
export async function createProduct(data: ProductCreateRequest): Promise<MyProduct> {
  return apiClient.post<MyProduct>('/api/v2/products', data);
}

/**
 * 내 상품 상세 조회 (GET /api/v2/products/my/{productId})
 */
export async function getMyProduct(productId: string | number): Promise<MyProduct> {
  return apiClient.get<MyProduct>(`/api/v2/products/my/${productId}`);
}

/**
 * 상품 수정 (PATCH /api/v2/products/my/{productId})
 */
export async function updateProduct(productId: string | number, data: ProductUpdateRequest): Promise<MyProduct> {
  return apiClient.patch<MyProduct>(`/api/v2/products/my/${productId}`, data);
}

/**
 * 재고 이력 조회 (GET /api/v2/products/my/stock-histories)
 */
export async function getStockHistory(params?: StockHistorySearchParams): Promise<StockHistoryPage> {
  const queryParams = new URLSearchParams();
  if (params?.productId !== undefined) queryParams.append('productId', params.productId.toString());
  if (params?.changeType) queryParams.append('changeType', params.changeType);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/v2/products/stock-histories/my?${queryString}`
    : '/api/v2/products/stock-histories/my';
  return apiClient.get<StockHistoryPage>(endpoint);
}
