import { apiClient } from './client';
import type {
  Wishlist,
  WishItem,
  WishlistVisibility,
  WishItemCreateRequest,
  FriendWishlistListResponse,
  PublicWishlistSummary,
  PublicWishlist,
} from '@/types/wishlist';

export interface WishlistVisibilityUpdateRequest {
  visibility: WishlistVisibility;
}

// Backend response types
interface BackendWishlistItemResponse {
  id: number;
  wishlistId: number;
  productId: number;
  status: string;
  addedAt: string;
}

function mapWishlistItemStatus(status: string): 'AVAILABLE' | 'IN_FUNDING' | 'FUNDED' {
  switch (status) {
    case 'FUNDING_IN_PROGRESS':
      return 'IN_FUNDING';
    case 'FUNDING_COMPLETED':
      return 'FUNDED';
    default:
      return 'AVAILABLE';
  }
}

export async function getMyWishlist(): Promise<Wishlist> {
  // Backend has separate endpoints for wishlist info and items
  // Fetch both and combine
  const [wishlistInfo, backendItems] = await Promise.all([
    apiClient.get<{ id: number; memberId: number; visibility: string }>('/api/wishlist/me'),
    apiClient.get<BackendWishlistItemResponse[]>('/api/wishlist/items/me'),
  ]);

  // Transform backend items to frontend format
  // Note: Backend only returns productId, so we create a minimal product placeholder
  // The full product info should be fetched separately if needed
  const items: WishItem[] = (backendItems || []).map((item) => ({
    id: item.id.toString(),
    wishlistId: item.wishlistId.toString(),
    productId: item.productId.toString(),
    product: {
      id: item.productId.toString(),
      name: `Product ${item.productId}`,
      price: 0,
      imageUrl: '',
      status: 'ON_SALE' as const,
      brandName: '',
    },
    status: mapWishlistItemStatus(item.status),
    fundingId: null,
    createdAt: item.addedAt || '',
  }));

  return {
    id: wishlistInfo.id.toString(),
    memberId: wishlistInfo.memberId.toString(),
    member: {
      id: wishlistInfo.memberId.toString(),
      nickname: '',
      avatarUrl: null,
    },
    visibility: wishlistInfo.visibility as WishlistVisibility,
    items,
    itemCount: items.length,
  };
}

export async function getWishlist(memberId: string): Promise<Wishlist> {
  // Fetch full wishlist including items from standard endpoint
  // Backend uses singular '/api/wishlist/items/{memberId}'
  return apiClient.get<Wishlist>(`/api/wishlist/items/${memberId}`);
}

export async function addWishlistItem(data: WishItemCreateRequest): Promise<WishItem> {
  // Backend uses query param: POST /api/wishlist/items/add?productId={id}
  return apiClient.post<WishItem>(`/api/wishlist/items/add?productId=${data.productId}`, {});
}

export async function removeWishlistItem(productId: string): Promise<void> {
  // Backend uses query param: DELETE /api/wishlist/items/remove?productId={id}
  return apiClient.delete<void>(`/api/wishlist/items/remove?productId=${productId}`);
}

export async function updateWishlistVisibility(data: WishlistVisibilityUpdateRequest): Promise<Wishlist> {
  // Backend: PATCH /api/wishlist/me/settings
  return apiClient.patch<Wishlist>('/api/wishlist/me/settings', data);
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
