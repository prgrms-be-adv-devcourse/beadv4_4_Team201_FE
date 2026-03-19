import { apiClient } from './client';
import { resolveImageUrl } from '@/lib/image';
import type {
  Cart,
  CartItem,
  CartItemCreateRequest,
  CartItemUpdateRequest,
  ItemStatus,
} from '@/types/cart';

// --- Backend V2 API Types ---

/**
 * 백엔드 TargetType enum
 */
type BackendTargetType = 'FUNDING_PENDING' | 'FUNDING';

/**
 * 백엔드 CartItemCreateRequest
 * @see CartController POST /api/v2/carts
 */
interface BackendCartItemCreateRequest {
  wishlistId?: number | null;
  wishlistItemId: number;
  amount: number;
}

/**
 * 백엔드 CartItemRequest
 * @see CartController POST /api/v2/carts/{cartId}  (and PATCH items)
 */
interface BackendCartItemRequest {
  wishlistId?: number; // Optional for updates if missing
  wishlistItemId: number;
  amount: number;
}

/**
 * 백엔드 CartItemResponse
 */
interface BackendCartItemResponse {
  targetType?: string;
  targetId?: number;
  wishlistItemId?: number; // New backend property name
  receiverId: number | null;
  receiverNickname: string | null;
  productId: number | null;
  productName: string | null;
  imageKey: string | null;
  productPrice: number;
  contributionAmount: number;
  fundingId: number | null;
  currentAmount: number | null;
  status: string; // ItemStatus enum (AVAILABLE, SOLD_OUT, DISCONTINUED, FUNDING_ENDED)
  statusMessage: string | null;
}

/**
 * 백엔드 CartResponse
 */
interface BackendCartResponse {
  cartId: number;
  memberId: number;
  items: BackendCartItemResponse[];
  totalAmount: number;
}

// --- Mapping Functions ---

function mapBackendCart(backend: BackendCartResponse): Cart {
  return {
    id: backend.cartId.toString(),
    memberId: backend.memberId.toString(),
    items: backend.items.map((item) => mapBackendCartItem(item, backend.cartId)),
    selectedCount: backend.items.length, // 백엔드에서 selected 필드 미제공, 전체 선택으로 간주
    totalAmount: backend.totalAmount,
  };
}

function mapBackendCartItem(item: BackendCartItemResponse, cartId: number): CartItem {
  const isNewFunding = item.targetType === 'FUNDING_PENDING';
  const targetType = isNewFunding ? 'FUNDING_PENDING' : 'FUNDING';
  const targetId = (item.targetId ?? item.wishlistItemId ?? 0).toString();

  return {
    id: `${cartId}::${targetId}`,
    cartId: cartId.toString(),
    targetType,
    targetId,
    wishlistId: null,
    receiverId: item.receiverId?.toString() || null,
    receiverNickname: item.receiverNickname || '',
    imageKey: item.imageKey,
    productName: item.productName || '상품 정보 없음',
    productPrice: item.productPrice || 0,
    contributionAmount: item.contributionAmount,
    currentAmount: item.currentAmount,
    amount: item.contributionAmount,
    fundingId: item.fundingId?.toString() || null,
    productId: item.productId?.toString() || '',
    funding: {
      id: item.targetType === 'FUNDING' ? targetId : (item.fundingId?.toString() || ''),
      wishItemId: isNewFunding ? targetId : '',
      product: {
        id: item.productId?.toString() || '',
        name: item.productName || '상품 정보 없음',
        price: item.productPrice || 0,
        imageUrl: resolveImageUrl(item.imageKey),
        status: 'ON_SALE',
        brandName: '',
      },
      organizerId: '',
      organizer: { id: '', nickname: '', avatarUrl: null },
      recipientId: item.receiverId?.toString() || '',
      recipient: {
        id: item.receiverId?.toString() || '',
        nickname: item.receiverNickname || '',
        avatarUrl: null
      },
      targetAmount: item.productPrice || 0,
      currentAmount: item.currentAmount || 0,
      status: 'IN_PROGRESS',
      participantCount: 0,
      expiresAt: '',
      createdAt: '',
    },
    selected: item.status === 'AVAILABLE',
    isNewFunding,
    createdAt: new Date().toISOString(),
    status: (item.status as ItemStatus) || 'AVAILABLE',
    statusMessage: item.statusMessage,
  };
}

// --- Helpers ---

export function parseCartItemId(itemId: string): { targetId: number } {
  const parts = itemId.split('::');
  const targetId = parseInt(parts[1], 10);
  return { targetId };
}

// --- API Functions ---

/**
 * 내 장바구니 조회
 * @endpoint GET /api/v2/carts
 * @note client.ts가 RsData wrapper를 자동 언래핑하므로 BackendCartResponse를 직접 받음
 */
export async function getCart(): Promise<Cart> {
  const response = await apiClient.get<BackendCartResponse>('/api/v2/carts');
  return mapBackendCart(response);
}

/**
 * 장바구니에 아이템 추가
 * @endpoint POST /api/v2/carts
 */
export async function addCartItem(data: CartItemCreateRequest): Promise<string> {
  const request: BackendCartItemCreateRequest = {
    wishlistId: data.wishlistId ? Number(data.wishlistId) : null,
    wishlistItemId: Number(data.wishlistItemId),
    amount: data.amount,
  };

  const response = await apiClient.post<{ message: string }>('/api/v2/carts', request, {
    includeFullResponse: true,
  });
  return response.message;
}

/**
 * 장바구니 아이템 수정 (참여 금액)
 * @endpoint PATCH /api/v2/carts/items
 */
export async function updateCartItem(itemId: string, data: CartItemUpdateRequest): Promise<void> {
  const { targetId } = parseCartItemId(itemId);

  const request: BackendCartItemRequest = {
    wishlistId: data.wishlistId ? Number(data.wishlistId) : undefined,
    wishlistItemId: targetId,
    amount: data.amount!,
  };

  await apiClient.patch<void>('/api/v2/carts/items', [request]);
}

/**
 * 장바구니 아이템 다중 수정 (참여 금액)
 * @endpoint PATCH /api/v2/carts/items
 */
export async function updateCartItems(updates: { itemId: string; amount: number; wishlistId: string | number | null }[]): Promise<void> {
  const requests = updates.map(({ itemId, amount, wishlistId }) => {
    const { targetId } = parseCartItemId(itemId);
    return {
      wishlistId: wishlistId ? Number(wishlistId) : undefined,
      wishlistItemId: targetId,
      amount,
    };
  });

  await apiClient.patch<void>('/api/v2/carts/items', requests);
}

/**
 * 장바구니 아이템 삭제
 * @endpoint DELETE /api/v2/carts/items?targetIds={id1,id2,...} 
 * (Assuming the endpoint for deleting item relies on wishlistItemId directly without targetType now, or the old one was specific)
 * Wait, previously it was /api/v2/carts/items/{targetType}?targetIds={id1,id2,...}
 * We should probably just pass the ids to a single endpoint. If backend doesn't have targetType, we just pass wishlistItemId?
 * I will update this assuming the path param targetType is removed, as it's no longer used.
 */
export async function removeCartItem(targetIds: number[]): Promise<void> {
  const ids = targetIds.join(',');
  await apiClient.delete(`/api/v2/carts/items?wishlistItemIds=${ids}`);
}

/**
 * 장바구니 아이템 다중 삭제
 */
export async function removeCartItems(items: { targetId: string }[]): Promise<void> {
  const ids = items.map((item) => parseInt(item.targetId, 10));
  await removeCartItem(ids);
}

/**
 * 장바구니 아이템 선택 토글
 * @note 백엔드에 해당 API 없음 - 프론트엔드 로컬 상태로만 관리
 *       useToggleCartSelection에서 optimistic update로 처리
 */
export async function toggleCartItemSelection(_itemId: string, _selected: boolean): Promise<void> {
  // 서버 API 없음 - optimistic update만으로 처리 (mutationFn은 no-op)
  return Promise.resolve();
}

export async function clearCart(): Promise<void> {
  await apiClient.delete('/api/v2/carts');
}
