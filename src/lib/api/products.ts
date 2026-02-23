import { apiClient } from './client';
import { resolveImageUrl } from '@/lib/image';
import type {
  Product,
  ProductDetail,
  ProductListResponse,
  ProductQueryParams,
  ProductSearchParams,
  PopularProductsResponse
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
  imageKey?: string;
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
  };
}

function mapBackendResponse(response: BackendProductResponse): ProductListResponse {
  const mappedProducts = response.content.map(mapBackendProduct);
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
  
  // 백엔드 ProductSearchDto에 맞게 파라미터 매핑
  if (params?.category) queryParams.append('keyword', params.category);
  if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const queryString = queryParams.toString();
  // 백엔드 엔드포인트: /api/v2/products/search
  const endpoint = queryString ? `/api/v2/products/search?${queryString}` : '/api/v2/products/search';

  const response = await apiClient.get<BackendProductResponse>(endpoint);
  return mapBackendResponse(response);
}

export async function searchProducts(params: SearchProductsParams): Promise<ProductListResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('keyword', params.q);
  if (params.category) queryParams.append('keyword', params.category);
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const response = await apiClient.get<BackendProductResponse>(`/api/v2/products/search?${queryParams.toString()}`);
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
    sellerId: '', // 백엔드에서 제공하지 않음
    description: product.description,
    images: [],
    stock: 100, // 백엔드에서 제공하지 않음
    category: 'GENERAL',
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    createdAt: product.createdAt,
  };
}

export async function getPopularProducts(limit?: number): Promise<PopularProductsResponse> {
  // 백엔드에 인기 상품 엔드포인트가 없으므로 일반 검색으로 대체
  const queryParams = new URLSearchParams();
  if (limit !== undefined) queryParams.append('size', limit.toString());
  queryParams.append('sort', 'createdAt,desc'); // 최신순으로 대체

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/v2/products/search?${queryString}` : '/api/v2/products/search';

  const response = await apiClient.get<BackendProductResponse>(endpoint);
  return {
    items: response.content.map(mapBackendProduct),
  };
}
