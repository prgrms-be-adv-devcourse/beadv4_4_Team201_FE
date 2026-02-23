import { apiClient } from './client';
import { resolveImageUrl } from '@/lib/image';
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

// Backend v2 response types
interface BackendV2WishlistItemResponse {
  id: number;
  wishlistId: number;
  productId: number;
  productName: string | null;
  price: number;
  imageKey: string | null;
  isSoldout: boolean;
  isActive: boolean;
  status: string;
  addedAt: string;
}

interface BackendV2WishlistResponse {
  id: number;
  memberId: number;
  nickname: string | null;
  visibility: string;
  createdAt: string;
  items: BackendV2WishlistItemResponse[];
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

function mapBackendItem(item: BackendV2WishlistItemResponse): WishItem {
  return {
    id: item.id.toString(),
    wishlistId: item.wishlistId.toString(),
    productId: item.productId.toString(),
    product: {
      id: item.productId.toString(),
      name: item.productName || '',
      price: item.price,
      imageUrl: resolveImageUrl(item.imageKey),
      status: item.isActive ? 'ON_SALE' as const : 'DISCONTINUED' as const,
      brandName: '',
    },
    status: mapWishlistItemStatus(item.status),
    fundingId: null,
    createdAt: item.addedAt || '',
  };
}

export async function getMyWishlist(): Promise<Wishlist> {
  const response = await apiClient.get<BackendV2WishlistResponse>('/api/v2/wishlists/me');

  const items = (response.items || []).map(mapBackendItem);

  return {
    id: response.id.toString(),
    memberId: response.memberId.toString(),
    member: {
      id: response.memberId.toString(),
      nickname: response.nickname || '',
      avatarUrl: null,
    },
    visibility: response.visibility as WishlistVisibility,
    items,
    itemCount: items.length,
  };
}

export async function getWishlist(memberId: string): Promise<Wishlist> {
  return apiClient.get<Wishlist>(`/api/v2/wishlists/${memberId}`);
}

export async function addWishlistItem(data: WishItemCreateRequest): Promise<WishItem> {
  return apiClient.post<WishItem>(`/api/v2/wishlists/me/items/add?productId=${data.productId}`, {});
}

export async function removeWishlistItem(productId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v2/wishlists/me/items/remove?productId=${productId}`);
}

export async function updateWishlistVisibility(data: WishlistVisibilityUpdateRequest): Promise<Wishlist> {
  return apiClient.patch<Wishlist>('/api/v2/wishlists/me/settings', data);
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
