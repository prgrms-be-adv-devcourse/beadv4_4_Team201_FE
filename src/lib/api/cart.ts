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
 * 백엔드 CartItemRequest
 * @see CartController POST /api/v2/carts/{cartId}
 */
interface BackendCartItemRequest {
  targetType: BackendTargetType;
  targetId: number;
  amount: number;
}

/**
 * 백엔드 CartItemResponse
 */
interface BackendCartItemResponse {
  targetType: BackendTargetType;
  targetId: number;
  receiverId: number;
  receiverNickname: string;
  productName: string | null;
  imageKey: string | null;
  productPrice: number;
  contributionAmount: number;
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

  return {
    id: `${cartId}::${item.targetType}::${item.targetId}`, // 복합 키 생성
    cartId: cartId.toString(),
    targetType: item.targetType as any,
    targetId: item.targetId.toString(),
    receiverId: item.receiverId?.toString() || null,
    receiverNickname: item.receiverNickname,
    imageKey: item.imageKey,
    productName: item.productName,
    productPrice: item.productPrice,
    contributionAmount: item.contributionAmount,
    currentAmount: item.currentAmount,
    amount: item.contributionAmount,
    funding: {
      id: item.targetType === 'FUNDING' ? item.targetId.toString() : '',
      wishItemId: item.targetType === 'FUNDING_PENDING' ? item.targetId.toString() : '',
      product: {
        id: '',
        name: item.productName || '',
        price: item.productPrice,
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
      targetAmount: item.productPrice,
      currentAmount: item.currentAmount || 0,
      status: 'IN_PROGRESS',
      participantCount: 0,
      expiresAt: '',
      createdAt: '',
    },
    selected: item.status === 'AVAILABLE', // unavailable 아이템은 비선택
    isNewFunding,
    createdAt: new Date().toISOString(),
    status: (item.status as ItemStatus) || 'AVAILABLE',
    statusMessage: item.statusMessage,
  };
}

// --- Helpers ---

export function parseCartItemId(itemId: string): { targetType: BackendTargetType; targetId: number } {
  const parts = itemId.split('::');
  const targetId = parseInt(parts[2], 10);
  const targetType = parts[1] as BackendTargetType;
  return { targetType, targetId };
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
export async function addCartItem(data: CartItemCreateRequest): Promise<void> {
  // CartItemCreateRequest를 BackendCartItemRequest로 변환
  let targetType: BackendTargetType;
  let targetId: number;
  let amount: number;

  if (data.fundingId) {
    targetType = 'FUNDING';
    targetId = parseInt(data.fundingId, 10);
    amount = data.amount;
  } else if (data.wishItemId) {
    targetType = 'FUNDING_PENDING';
    targetId = parseInt(data.wishItemId, 10);
    amount = data.amount || 0;
  } else {
    throw new Error('fundingId or wishItemId is required');
  }

  const request: BackendCartItemRequest = {
    targetType,
    targetId,
    amount,
  };

  await apiClient.post<void>('/api/v2/carts', request);
}

/**
 * 장바구니 아이템 수정 (참여 금액)
 * @endpoint PATCH /api/v2/carts/items
 */
export async function updateCartItem(itemId: string, data: CartItemUpdateRequest): Promise<void> {
  const { targetType, targetId } = parseCartItemId(itemId);

  const request: BackendCartItemRequest = {
    targetType,
    targetId,
    amount: data.amount!,
  };

  await apiClient.patch<void>('/api/v2/carts/items', [request]);
}

/**
 * 장바구니 아이템 다중 수정 (참여 금액)
 * @endpoint PATCH /api/v2/carts/items
 */
export async function updateCartItems(updates: { itemId: string; amount: number }[]): Promise<void> {
  const requests = updates.map(({ itemId, amount }) => {
    const { targetType, targetId } = parseCartItemId(itemId);
    return {
      targetType,
      targetId,
      amount,
    };
  });

  await apiClient.patch<void>('/api/v2/carts/items', requests);
}

/**
 * 장바구니 아이템 삭제
 * @endpoint DELETE /api/v2/carts/items/{targetType}?targetIds={id1,id2,...}
 */
export async function removeCartItem(targetType: string, targetIds: number[]): Promise<void> {
  // 1. 배열을 쉼표로 연결 (예: [8, 9] -> "8,9")
  const ids = targetIds.join(',');

  // 2. URL 뒤에 직접 ?targetIds=... 를 붙임
  await apiClient.delete(`/api/v2/carts/items/${targetType}?targetIds=${ids}`);
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
