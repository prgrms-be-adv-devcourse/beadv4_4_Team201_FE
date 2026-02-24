import { PaginatedResponse } from './api';

// --- Backend V2 Order Types ---

/**
 * 결제 방법
 * @see PaymentMethod.java
 */
export type PaymentMethod =
    | 'CARD'
    | 'KAKAO_PAY'
    | 'NAVER_PAY'
    | 'TOSS_PAY'
    | 'ACCOUNT_TRANSFER'
    | 'VIRTUAL_ACCOUNT'
    | 'BANK_TRANSFER'
    | 'DEPOSIT'
    | 'POINT';

/**
 * 주문 아이템 타입
 * @see OrderItemType.java
 */
export type OrderItemType = 'NORMAL_ORDER' | 'FUNDING_GIFT' | 'NORMAL_GIFT';

/**
 * 주문 상태
 * @see OrderStatus.java
 */
export type OrderStatus =
    | 'CREATED'
    | 'PAID'
    | 'PARTIAL_CONFIRMED'
    | 'CONFIRMED'
    | 'PARTIAL_CANCELING'
    | 'CANCELING'
    | 'PARTIAL_CANCELED'
    | 'CANCELED';

/**
 * 주문 아이템 상태
 * @see OrderItemStatus.java
 */
export type OrderItemStatus = 'CREATED' | 'PAID' | 'CANCELING' | 'CANCELED' | 'CONFIRMED';

/**
 * Order summary for list views
 * @see OrderSummary.java
 */
export interface Order {
    id: string;
    orderNumber: string;
    quantity: number;
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    createdAt: string;
    paidAt: string | null;
    confirmedAt: string | null;
    cancelledAt: string | null;
}

/**
 * Order item detail
 * @see OrderItemDetail.java
 */
export interface OrderItem {
    id: string;
    targetId: string;
    orderItemType: OrderItemType;
    sellerId: string;
    receiverId: string;
    price: number;
    amount: number;
    status: OrderItemStatus;
    cancelledAt: string | null;
}

/**
 * Detailed order with items
 * @see OrderDetail.java
 */
export interface OrderDetail {
    order: Order;
    items: OrderItem[];
}

// --- Request Types ---

/**
 * 주문 아이템 요청 DTO
 * @see PlaceOrderItemRequest.java
 */
export interface PlaceOrderItemRequest {
    wishlistItemId: number;
    receiverId: number;
    amount: number;
    orderItemType: OrderItemType;
}

/**
 * 주문+결제 요청 DTO
 * @see PlaceOrderRequest.java
 */
export interface PlaceOrderRequest {
    items: PlaceOrderItemRequest[];
    method: PaymentMethod;
}

/**
 * 주문 생성 결과
 * @see PlaceOrderResult.java
 */
export interface PlaceOrderResult {
    orderId: string;
}

// --- Legacy types for backward compatibility ---

/**
 * @deprecated Use PlaceOrderRequest instead
 */
export interface OrderCreateRequest {
    cartItemIds?: string[];
}

/**
 * Paginated list of orders
 */
export type OrderListResponse = PaginatedResponse<Order>;
