import { apiClient } from './client';
import { resolveImageUrl } from '@/lib/image';
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
  WishItemStatus,
} from '@/types/wishlist';

export interface UpdateWishlistSettingsRequest {
  visibility: WishlistVisibility;
}

// Backend response types are handled by the Wishlist interface from @/types/wishlist

export async function getMyWishlist(params?: WishlistQueryParams): Promise<Wishlist> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.page !== undefined && params?.size !== undefined) {
    queryParams.append('offset', (params.page * params.size).toString());
  }
  if (params?.category) queryParams.append('category', params.category.toUpperCase());
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/v2/wishlists/me?${queryString}` : '/api/v2/wishlists/me';

  const response = await apiClient.get<any>(endpoint);
  return transformWishlist(response);
}

export async function getWishlist(memberId: string, params?: WishlistQueryParams): Promise<Wishlist> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.page !== undefined && params?.size !== undefined) {
    queryParams.append('offset', (params.page * params.size).toString());
  }
  if (params?.category) queryParams.append('category', params.category.toUpperCase());
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/v2/wishlists/${memberId}?${queryString}` : `/api/v2/wishlists/${memberId}`;

  const response = await apiClient.get<any>(endpoint);
  return transformWishlist(response);
}

/**
 * Transforms backend v2 wishlist response to frontend format.
 * Handles both flat (v2) and nested (v1/mock) item structures.
 */
function transformWishlist(data: any): Wishlist {
  if (!data) return data;

  const isArray = Array.isArray(data);
  const rawItems = isArray ? data : (Array.isArray(data.items) ? data.items : (data.items?.content || []));

  const mapStatus = (s: string): WishItemStatus => {
    const status = (s || '').toUpperCase();
    switch (status) {
      case 'PENDING': return 'PENDING';
      case 'IN_PROGRESS': return 'IN_PROGRESS';
      case 'REQUESTED_CONFIRM': return 'REQUESTED_CONFIRM';
      case 'COMPLETED': return 'COMPLETED';
      // Legacy mappings
      case 'AVAILABLE': return 'PENDING';
      case 'IN_FUNDING': return 'IN_PROGRESS';
      case 'FUNDED': return 'COMPLETED';
      default: return 'PENDING';
    }
  };

  const items = rawItems.map((item: any) => {
    // If it's already a WishItem (nested product), return as is
    if (item.product && typeof item.product === 'object' && item.product.id) {
      return {
        ...item,
        id: (item.id || item.wishlistItemId || '').toString(),
        productId: (item.productId || item.product.id || '').toString(),
        status: mapStatus(item.status),
      };
    }

    // Otherwise, it's a flat style, transform it
    return {
      id: (item.wishlistItemId || item.id || '').toString(),
      wishlistId: (item.wishlistId || data.id || '').toString(),
      productId: (item.productId || '').toString(),
      product: {
        id: (item.productId || '').toString(),
        name: item.productName || item.name || '',
        price: item.price || 0,
        imageUrl: resolveImageUrl(item.imageKey || item.imageUrl || item.productImageUrl),
        status: 'ON_SALE' as const,
        brandName: item.brandName || item.sellerNickname || '',
        sellerNickname: item.sellerNickname || '',
        category: item.category || item.productCategory || '',
        isSoldout: item.isSoldout || false,
        isActive: item.isActive !== false,
      },
      status: mapStatus(item.status),
      fundingId: item.fundingId || null,
      createdAt: item.addedAt || item.createdAt || '',
    };
  });

  if (isArray) {
    return {
      id: '',
      memberId: '',
      member: { nickname: '친구' } as any,
      visibility: 'PUBLIC',
      items,
      itemCount: items.length,
    };
  }

  const member = data.member || {
    id: (data.memberId || data.id || '').toString(),
    nickname: data.nickname || data.memberNickname || '친구',
    avatarUrl: data.avatarUrl || data.memberAvatarUrl || null
  };

  // Improved total elements extraction based on user's specific response format
  const totalElements = data.items?.totalElements ?? data.totalElements ?? data.itemCount ?? items.length;

  // Map pagination data from items object
  let page = data.page;
  if (!page && data.items && typeof data.items === 'object') {
    const p = data.items;
    if ('pageNumber' in p) {
      page = {
        pageNumber: p.pageNumber,
        pageSize: p.pageSize,
        totalElements: p.totalElements,
        totalPages: p.totalPages,
        isFirst: p.isFirst,
        isLast: p.isLast,
      };
    } else if (p.pageable) {
      page = {
        pageNumber: p.number ?? p.pageable.pageNumber,
        pageSize: p.size ?? p.pageable.pageSize,
        totalElements: totalElements,
        totalPages: p.totalPages,
        isFirst: p.first,
        isLast: p.last,
      };
    }
  }

  return {
    ...data,
    id: (data.id || '').toString(),
    memberId: (data.memberId || '').toString(),
    member,
    items,
    itemCount: totalElements,
    page,
  };
}

export async function checkWishlistItemExistence(productId: string): Promise<boolean> {
  const id = productId.replace('product-', '');
  return apiClient.get<boolean>(`/api/v2/wishlists/me/items/check?productId=${id}`);
}

export async function addWishlistItem(data: WishItemCreateRequest): Promise<void> {
  const id = 'productId' in data ? data.productId : (data as any).id;
  return apiClient.post<void>(`/api/v2/wishlists/me/items/add?productId=${id}`, {});
}

export async function removeWishlistItem(itemId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v2/wishlists/items/${itemId}`);
}

export async function updateWishlistVisibility(data: UpdateWishlistSettingsRequest): Promise<Wishlist> {
  const response = await apiClient.patch<any>('/api/v2/wishlists/me/settings', data);
  return transformWishlist(response);
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
