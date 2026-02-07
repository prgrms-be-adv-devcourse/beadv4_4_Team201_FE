import { apiClient } from './client';
import type {
  Cart,
  CartItem,
  CartItemCreateRequest,
  CartItemUpdateRequest
} from '@/types/cart';

// --- Backend V2 API Types ---

/**
 * 백엔드 TargetType enum
 */
type BackendTargetType = 'FUNDING_PENDING' | 'FUNDING' | 'GENERAL_PRODUCT';

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
  productName: string;
  productPrice: number;
  contributionAmount: number;
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
    items: backend.items.map((item, index) => mapBackendCartItem(item, backend.cartId, index)),
    selectedCount: backend.items.length, // 백엔드에서 selected 필드 미제공, 전체 선택으로 간주
    totalAmount: backend.totalAmount,
  };
}

function mapBackendCartItem(item: BackendCartItemResponse, cartId: number, index: number): CartItem {
  const isNewFunding = item.targetType === 'FUNDING_PENDING';

  return {
    id: `${cartId}-${item.targetType}-${item.targetId}`, // 복합 키 생성
    cartId: cartId.toString(),
    fundingId: item.targetType === 'FUNDING' ? item.targetId.toString() : '',
    funding: {
      id: item.targetType === 'FUNDING' ? item.targetId.toString() : '',
      wishItemId: item.targetType === 'FUNDING_PENDING' ? item.targetId.toString() : '',
      product: {
        id: '',
        name: item.productName,
        price: item.productPrice,
        imageUrl: '/images/placeholder-product.svg',
        status: 'ON_SALE',
        brandName: '',
      },
      organizerId: '',
      organizer: { id: '', nickname: '', avatarUrl: null },
      recipientId: '',
      recipient: { id: '', nickname: '', avatarUrl: null },
      targetAmount: item.productPrice,
      currentAmount: 0,
      status: 'IN_PROGRESS',
      participantCount: 0,
      expiresAt: '',
      createdAt: '',
    },
    amount: item.contributionAmount,
    selected: true, // 백엔드에서 미제공, 기본값 true
    isNewFunding,
    createdAt: new Date().toISOString(),
  };
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
    // 기존 펀딩에 참여
    targetType = 'FUNDING';
    targetId = parseInt(data.fundingId, 10);
    amount = data.amount || 0;
  } else if (data.wishItemId) {
    // 새 펀딩 개설
    targetType = 'FUNDING_PENDING';
    targetId = parseInt(data.wishItemId, 10);
    amount = data.amount || 0;
  } else if (data.productId) {
    // 일반 상품 (현재 백엔드에서 미지원)
    targetType = 'GENERAL_PRODUCT';
    targetId = parseInt(data.productId, 10);
    amount = data.quantity || 1;
  } else {
    throw new Error('fundingId, wishItemId, or productId is required');
  }

  const request: BackendCartItemRequest = {
    targetType,
    targetId,
    amount,
  };

  await apiClient.post<void>('/api/v2/carts', request);
}

/**
 * 장바구니 아이템 수정
 * @note 백엔드에 해당 API 없음 - 삭제 후 재추가로 처리 필요
 * @todo 백엔드에 PATCH /api/v2/carts/{cartId}/items/{itemId} 추가 요청
 */
export async function updateCartItem(_itemId: string, _data: CartItemUpdateRequest): Promise<CartItem> {
  throw new Error(
    '장바구니 아이템 수정 API가 백엔드에 없습니다. 삭제 후 재추가로 처리해주세요.'
  );
}

/**
 * 장바구니 아이템 삭제
 * @note 백엔드에 해당 API 없음
 * @todo 백엔드에 DELETE /api/v2/carts/{cartId}/items/{itemId} 추가 요청
 */
export async function removeCartItem(_itemId: string): Promise<void> {
  throw new Error(
    '장바구니 아이템 삭제 API가 백엔드에 없습니다.'
  );
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

/**
 * 장바구니 비우기
 * @note 백엔드에 해당 API 없음
 * @todo 백엔드에 DELETE /api/v2/carts/{cartId} 추가 요청
 */
export async function clearCart(): Promise<void> {
  throw new Error(
    '장바구니 비우기 API가 백엔드에 없습니다.'
  );
}
