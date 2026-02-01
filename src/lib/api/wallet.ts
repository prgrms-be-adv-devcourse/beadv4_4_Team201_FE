import { apiClient } from './client';
import type {
  Wallet,
  WalletChargeRequest,
  WalletChargeResponse,
  WalletWithdrawRequest,
  WalletWithdrawResponse,
  TransactionType,
  WalletHistoryResponse,
  WalletHistoryQueryParams
} from '@/types/wallet';

// Alias for backward compatibility
export type WalletTransactionType = TransactionType;
export type WalletHistoryParams = WalletHistoryQueryParams;

export async function getWallet(): Promise<Wallet> {
  return apiClient.get<Wallet>('/api/v2/wallet/balance');
}

export async function chargeWallet(data: WalletChargeRequest): Promise<WalletChargeResponse> {
  return apiClient.post<WalletChargeResponse>('/api/v2/wallet/charge', data);
}

export async function getWalletHistory(params?: WalletHistoryParams): Promise<WalletHistoryResponse> {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/v2/wallet/history?${queryString}` : '/api/v2/wallet/history';

  return apiClient.get<WalletHistoryResponse>(endpoint);
}

export async function withdrawWallet(data: WalletWithdrawRequest): Promise<WalletWithdrawResponse> {
  return apiClient.post<WalletWithdrawResponse>('/api/v2/wallet/withdraw', data);
}
