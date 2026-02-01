import { apiClient } from './client';

// Types
export interface CreateChargePaymentRequest {
  amount: number;
  orderId?: string;
}

export interface CreateChargePaymentResponse {
  paymentId: number;
  orderId: string;
  amount: number;
  idempotencyKey: string;
  status: string;
}

export interface ConfirmPaymentRequest {
  paymentId: number;
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  paymentId?: number;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * 충전용 Payment 생성
 * - Toss SDK 호출 전에 먼저 호출
 * - orderId, amount를 받아서 SDK에 전달
 */
export async function createChargePayment(
  data: CreateChargePaymentRequest
): Promise<CreateChargePaymentResponse> {
  return apiClient.post<CreateChargePaymentResponse>('/api/v2/payments/charge', data);
}

/**
 * Payment 승인 (Toss 결제 완료 후 호출)
 * - successUrl로 리다이렉트된 후 호출
 * - 백엔드에서 금액 검증 + Toss API 승인
 */
export async function confirmPayment(
  data: ConfirmPaymentRequest
): Promise<ConfirmPaymentResponse> {
  return apiClient.post<ConfirmPaymentResponse>('/api/v2/payments/confirm', data);
}
