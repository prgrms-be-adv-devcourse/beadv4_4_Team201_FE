import { apiClient } from './client';
import type { PageParams } from '@/types/api';
import type {
  Wishlist,
  WishItem,
  WishlistVisibility,
  WishItemCreateRequest,
  FriendWishlistListResponse,
  PublicWishlistSummary,
  PublicWishlist,
  WishlistQueryParams,
} from '@/types/wishlist';

export interface WishlistVisibilityUpdateRequest {
  visibility: WishlistVisibility;
}

// Backend response types are handled by the Wishlist interface from @/types/wishlist

export async function getMyWishlist(params?: WishlistQueryParams): Promise<Wishlist> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/v2/wishlists/me?${queryString}` : '/api/v2/wishlists/me';

  const response = await apiClient.get<any>(endpoint);
  return transformWishlist(response);
}

export async function getWishlist(memberId: string): Promise<Wishlist> {
  const response = await apiClient.get<any>(`/api/v2/wishlists/${memberId}`);
  return transformWishlist(response);
}

/**
 * Transforms backend v2 wishlist response to frontend format.
 * Handles both flat (v2) and nested (v1/mock) item structures.
 */
function transformWishlist(data: any): Wishlist {
  if (!data) return data;

  // Handle case where items might be missing or already in correct format
  const items = (data.items || []).map((item: any) => {
    // If it's already a WishItem (nested product), return as is
    if (item.product && item.product.id) {
      return {
        ...item,
        id: item.id.toString(),
        productId: item.productId.toString(),
      };
    }

    // Otherwise, it's a flat PublicWishlistItem style, transform it
    return {
      id: (item.wishlistItemId || item.id).toString(),
      wishlistId: (item.wishlistId || data.id || '').toString(),
      productId: item.productId.toString(),
      product: {
        id: item.productId.toString(),
        name: item.productName || '',
        price: item.price || 0,
        imageUrl: item.imageUrl || '',
        status: 'ON_SALE' as const,
        brandName: item.brandName || '',
        sellerNickname: item.sellerNickname || '',
      },
      status: item.status || 'AVAILABLE',
      fundingId: item.fundingId || null,
      createdAt: item.addedAt || item.createdAt || '',
    };
  });

  return {
    ...data,
    id: data.id.toString(),
    memberId: data.memberId.toString(),
    items,
    itemCount: data.itemCount || items.length,
    page: data.page,
  };
}

export async function addWishlistItem(data: WishItemCreateRequest): Promise<WishItem> {
  return apiClient.post<WishItem>('/api/v2/wishlists/items', data);
}

export async function removeWishlistItem(itemId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v2/wishlists/items/${itemId}`);
}

export async function updateWishlistVisibility(data: WishlistVisibilityUpdateRequest): Promise<Wishlist> {
  return apiClient.patch<Wishlist>('/api/v2/wishlists/visibility', data);
}

export async function getFriendsWishlists(limit?: number): Promise<FriendWishlistListResponse> {
  const queryParams = new URLSearchParams();
  if (limit !== undefined) queryParams.append('limit', limit.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/v2/friends/wishlists?${queryString}` : '/api/v2/friends/wishlists';

  return apiClient.get<FriendWishlistListResponse>(endpoint);
}

interface BackendMemberWishlistSummary {
  memberId: number;
  nickname: string;
}

interface BackendPublicWishlistItem {
  wishlistItemId: number;
  productId: number;
  productName: string;
  price: number;
  addedAt: string;
}

interface BackendPublicWishlistResponse {
  memberId: number;
  nickname: string;
  items: BackendPublicWishlistItem[];
}

export async function searchPublicWishlists(nickname?: string): Promise<PublicWishlistSummary[]> {
  const queryParams = new URLSearchParams();
  if (nickname) queryParams.append('nickname', nickname);

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/v2/wishlists/search?${queryString}`
    : '/api/v2/wishlists/search';

  const response = await apiClient.get<BackendMemberWishlistSummary[]>(endpoint);

  return response.map((item) => ({
    memberId: item.memberId.toString(),
    nickname: item.nickname,
  }));
}

export async function getPublicWishlist(memberId: string): Promise<PublicWishlist | null> {
  const response = await apiClient.get<BackendPublicWishlistResponse | null>(
    `/api/v2/wishlists/${memberId}`
  );

  if (!response) return null;

  return {
    memberId: response.memberId.toString(),
    nickname: response.nickname,
    items: response.items.map((item) => ({
      wishlistItemId: item.wishlistItemId.toString(),
      productId: item.productId.toString(),
      productName: item.productName,
      price: item.price,
      addedAt: item.addedAt,
    })),
  };
}
