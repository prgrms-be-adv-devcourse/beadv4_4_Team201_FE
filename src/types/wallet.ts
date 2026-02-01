import { PaginatedResponse } from './api';

/**
 * Transaction type enumeration
 * - CHARGE: Wallet charge (deposit)
 * - PAYMENT: Payment (withdrawal)
 * - WITHDRAW: Withdrawal to bank account
 */
export type TransactionType = 'CHARGE' | 'PAYMENT' | 'WITHDRAW';

/**
 * Wallet information
 */
export interface Wallet {
    walletId: number;
    balance: number;
}

/**
 * Request body for wallet charge
 */
export interface WalletChargeRequest {
    amount: number;
}

/**
 * Response for wallet charge request
 */
export interface WalletChargeResponse {
    chargeId: string;
    paymentUrl: string;
    amount: number;
}

/**
 * Wallet transaction record
 */
export interface WalletTransaction {
    id: string;
    type: TransactionType;
    amount: number;
    balanceAfter: number;
    description: string;
    relatedId: string | null;
    createdAt: string;
}

/**
 * Paginated list of wallet transactions
 */
export type WalletHistoryResponse = PaginatedResponse<WalletTransaction>;

/**
 * Query parameters for wallet history
 */
export interface WalletHistoryQueryParams {
    type?: TransactionType;
    page?: number;
    size?: number;
}

/**
 * Request body for wallet withdrawal
 */
export interface WalletWithdrawRequest {
    amount: number;
    bankCode: string;
    accountNumber: string;
}

/**
 * Response for wallet withdrawal request
 */
export interface WalletWithdrawResponse {
    walletId: number;
    balance: number;
    withdrawnAmount: number;
    transactionId: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

/**
 * Bank option for withdrawal
 */
export interface BankOption {
    code: string;
    name: string;
}
