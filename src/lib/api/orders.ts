import { apiClient } from './client';
import { mapCustomPage } from './pagination';
import type { PageParams } from '@/types/api';
import type {
  Order,
  OrderDetail,
  OrderListResponse,
  PlaceOrderRequest,
  PlaceOrderResult,
  PaymentMethod,
} from '@/types/order';

// --- Backend V2 API Response Types ---

/**
 * 백엔드 Money VO
 */
interface BackendMoney {
  amount: number;
}

/**
 * 백엔드 OrderSummary
 */
interface BackendOrderSummary {
  orderId: number;
  orderNumber: string;
  quantity: number;
  totalAmount: BackendMoney;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paidAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
}

/**
 * 백엔드 OrderItemDetail
 */
interface BackendOrderItemDetail {
  orderItemId: number;
  targetId: number;
  orderItemType: string;
  sellerId: number;
  receiverId: number;
  price: BackendMoney;
  amount: BackendMoney;
  status: string;
  cancelledAt: string | null;
}

/**
 * 백엔드 OrderDetail
 */
interface BackendOrderDetail {
  order: BackendOrderSummary;
  items: BackendOrderItemDetail[];
}

/**
 * 백엔드 GetOrderDetailResponse
 */
interface BackendGetOrderDetailResponse {
  orderDetail: BackendOrderDetail;
}

/**
 * 백엔드 GetOrdersResponse
 */
interface BackendGetOrdersResponse {
  orders: BackendOrderSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 백엔드 PlaceOrderResult
 */
interface BackendPlaceOrderResult {
  orderId: number;
}

// --- Mapping Functions ---

function mapBackendOrder(backend: BackendOrderSummary): Order {
  return {
    id: backend.orderId.toString(),
    orderNumber: backend.orderNumber,
    quantity: backend.quantity,
    totalAmount: backend.totalAmount.amount,
    status: backend.status as Order['status'],
    paymentMethod: backend.paymentMethod as PaymentMethod,
    createdAt: backend.createdAt,
    paidAt: backend.paidAt,
    confirmedAt: backend.confirmedAt,
    cancelledAt: backend.cancelledAt,
  };
}

function mapBackendOrderDetail(backend: BackendOrderDetail): OrderDetail {
  return {
    order: mapBackendOrder(backend.order),
    items: backend.items.map(item => ({
      id: item.orderItemId.toString(),
      targetId: item.targetId.toString(),
      orderItemType: item.orderItemType as OrderDetail['items'][0]['orderItemType'],
      sellerId: item.sellerId.toString(),
      receiverId: item.receiverId.toString(),
      price: item.price.amount,
      amount: item.amount.amount,
      status: item.status as OrderDetail['items'][0]['status'],
      cancelledAt: item.cancelledAt,
    })),
  };
}

// --- API Functions ---

/**
 * 주문+결제 생성 (V2 통합 API)
 * @endpoint POST /api/v2/orders
 * @note 주문 생성과 결제가 한 번에 처리됩니다
 */
export async function placeOrder(
  request: PlaceOrderRequest,
  idempotencyKey?: string
): Promise<PlaceOrderResult> {
  const backendRequest = {
    items: request.items.map(item => ({
      ...item,
      amount: { amount: item.amount },
    })),
    method: request.method,
  };

  const response = await apiClient.post<BackendPlaceOrderResult>(
    '/api/v2/orders',
    backendRequest,
    { idempotencyKey }
  );
  return {
    orderId: response.orderId.toString(),
  };
}

/**
 * 주문 상세 조회
 * @endpoint GET /api/v2/orders/{orderId}
 */
export async function getOrder(orderId: string): Promise<OrderDetail> {
  const response = await apiClient.get<BackendGetOrderDetailResponse>(
    `/api/v2/orders/${orderId}`
  );
  return mapBackendOrderDetail(response.orderDetail);
}

/**
 * 주문 목록 조회
 * @endpoint GET /api/v2/orders
 */
export async function getOrders(params?: PageParams): Promise<OrderListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/v2/orders?${queryString}` : '/api/v2/orders';

  const response = await apiClient.get<BackendGetOrdersResponse>(endpoint);
  const orders = response.orders.map(mapBackendOrder);

  return mapCustomPage(orders, {
    page: response.page,
    size: response.size,
    totalElements: response.totalElements,
    totalPages: response.totalPages,
    hasNext: response.hasNext,
    hasPrevious: response.hasPrevious,
  });
}
