import { apiClient } from './client';
import { resolveImageUrl } from '@/lib/image';
import type {
  Wishlist,
  WishlistVisibility,
  WishItemCreateRequest,
  FriendWishlistListResponse,
  PublicWishlistSummary,
  PublicWishlist,
  WishlistQueryParams,
  WishItemStatus,
  WishItem,
} from '@/types/wishlist';
import type { MemberPublic } from '@/types/member';
import type { PageInfo } from '@/types/api';

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

  const response = await apiClient.get<unknown>(endpoint);
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

  const response = await apiClient.get<unknown>(endpoint);
  return transformWishlist(response);
}

/**
 * Transforms backend v2 wishlist response to frontend format.
 * Handles both flat (v2) and nested (v1/mock) item structures.
 */
function transformWishlist(data: unknown): Wishlist {
  if (!data) return {} as Wishlist;

  const isArray = Array.isArray(data);
  const dataObj = data as Record<string, unknown>;
  const dataItems = dataObj.items as { content?: unknown[] } | unknown[] | undefined;
  const rawItems = isArray ? data : (Array.isArray(dataItems) ? dataItems : ((dataItems as { content?: unknown[] })?.content || []));

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

  const items = rawItems.map((item: Record<string, unknown>): WishItem => {
    // If it's already a WishItem (nested product), return as is
    const product = item.product as { id?: string } | undefined;
    if (product && typeof product === 'object' && product.id) {
      return {
        id: (item.id || item.wishlistItemId || '').toString(),
        wishlistId: (item.wishlistId || '').toString(),
        productId: (item.productId || product.id || '').toString(),
        product: product as WishItem['product'],
        status: mapStatus((item.status as string) || ''),
        fundingId: (item.fundingId as string | null) || null,
        createdAt: (item.createdAt as string) || '',
      };
    }

    const category = ((item.category || item.productCategory || '') as string);
    const imageKey = (item.imageKey || item.imageUrl || item.productImageUrl || '') as string | null | undefined;
    // Otherwise, it's a flat style, transform it
    return {
      id: (item.wishlistItemId || item.id || '').toString(),
      wishlistId: (item.wishlistId || dataObj.id || '').toString(),
      productId: (item.productId || '').toString(),
      product: {
        id: (item.productId || '').toString(),
        name: (item.productName || item.name || '') as string,
        price: (item.price || 0) as number,
        imageUrl: resolveImageUrl(imageKey, category),
        status: 'ON_SALE' as const,
        brandName: (item.brandName || item.sellerNickname || '') as string,
        sellerNickname: (item.sellerNickname || '') as string,
        category: category,
        isSoldout: (item.isSoldout || false) as boolean,
        isActive: (item.isActive !== false) as boolean,
      },
      status: mapStatus((item.status as string) || ''),
      fundingId: (item.fundingId as string | null) || null,
      createdAt: (item.addedAt || item.createdAt || '') as string,
    };
  });

  if (isArray) {
    return {
      id: '',
      memberId: '',
      member: { id: '', nickname: '친구', avatarUrl: null },
      visibility: 'PUBLIC',
      items,
      itemCount: items.length,
    };
  }

  const dataMember = dataObj.member as Record<string, unknown> | undefined;
  const member: MemberPublic = dataMember ? {
    id: (dataMember.id || '').toString(),
    nickname: (dataMember.nickname || '친구') as string,
    avatarUrl: (dataMember.avatarUrl || null) as string | null,
  } : {
    id: (dataObj.memberId || dataObj.id || '').toString(),
    nickname: ((dataObj.nickname || dataObj.memberNickname || '친구') as string),
    avatarUrl: ((dataObj.avatarUrl || dataObj.memberAvatarUrl || null) as string | null),
  };

  // Improved total elements extraction based on user's specific response format
  const dataItemsObj = dataObj.items as Record<string, unknown> | undefined;
  const totalElements = (dataItemsObj?.totalElements || dataObj.totalElements || dataObj.itemCount || items.length) as number;

  // Map pagination data from items object
  let page: PageInfo | undefined = dataObj.page as PageInfo | undefined;
  if (!page && dataItemsObj && typeof dataItemsObj === 'object') {
    const p = dataItemsObj as Record<string, unknown>;
    if ('pageNumber' in p) {
      const pageNumber = p.pageNumber as number;
      const pageSize = p.pageSize as number;
      const pTotalPages = p.totalPages as number;
      page = {
        page: pageNumber,
        size: pageSize,
        totalElements: p.totalElements as number,
        totalPages: pTotalPages,
        hasNext: pageNumber < pTotalPages - 1,
        hasPrevious: pageNumber > 0,
      };
    } else if (p.pageable) {
      const pageable = p.pageable as Record<string, unknown>;
      const pageNumber = (p.number ?? pageable.pageNumber) as number;
      const pageSize = (p.size ?? pageable.pageSize) as number;
      const pTotalPages = p.totalPages as number;
      page = {
        page: pageNumber,
        size: pageSize,
        totalElements: totalElements,
        totalPages: pTotalPages,
        hasNext: pageNumber < pTotalPages - 1,
        hasPrevious: pageNumber > 0,
      };
    }
  }

  return {
    id: (dataObj.id || '').toString(),
    memberId: (dataObj.memberId || '').toString(),
    member,
    visibility: (dataObj.visibility || 'PUBLIC') as 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY',
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
  const id = 'productId' in data ? data.productId : (data as { id: string }).id;
  return apiClient.post<void>(`/api/v2/wishlists/me/items/add?productId=${id}`, {});
}

export async function removeWishlistItem(itemId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v2/wishlists/items/${itemId}`);
}

export async function updateWishlistVisibility(data: UpdateWishlistSettingsRequest): Promise<Wishlist> {
  const response = await apiClient.patch<unknown>('/api/v2/wishlists/me/settings', data);
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
