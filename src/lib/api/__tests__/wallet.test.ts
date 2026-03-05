import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWallet, getWalletHistory, withdrawWallet } from '../wallet';
import * as apiClient from '../client';

vi.mock('../client');

describe('wallet API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getWallet', () => {
        it('GIVEN wallet endpoint returns data, THEN it should return wallet info', async () => {
            const mockWallet = { walletId: 1, balance: 100000 };
            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockWallet);

            const result = await getWallet();

            expect(result).toEqual(mockWallet);
            expect(apiClient.apiClient.get).toHaveBeenCalledWith('/api/v2/wallet/balance');
        });
    });

    describe('getWalletHistory', () => {
        it('GIVEN query params, THEN it should fetch paginated history', async () => {
            const mockPage = {
                content: [{ id: 't1', type: 'CHARGE', amount: 10000, balanceAfter: 10000, description: '충전', relatedId: null, createdAt: '2026-01-01' }],
                pageable: { pageNumber: 0, pageSize: 20 },
                totalElements: 1,
                totalPages: 1,
                size: 20,
                number: 0,
                first: true,
                last: true,
                empty: false,
            };
            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockPage);

            const result = await getWalletHistory({ type: 'CHARGE', page: 0, size: 20 });

            expect(result.content).toHaveLength(1);
            expect(result.page.page).toBe(0);
            expect(apiClient.apiClient.get).toHaveBeenCalledWith('/api/v2/wallet/history?type=CHARGE&page=0&size=20');
        });
    });

    describe('withdrawWallet', () => {
        it('GIVEN withdraw request, THEN it should POST withdrawal', async () => {
            const mockResponse = { walletId: 1, balance: 50000, withdrawnAmount: 50000, transactionId: 't1', status: 'PENDING' as const };
            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            const result = await withdrawWallet({
                amount: 50000,
                bankCode: '004',
                accountNumber: '1234567890',
            });

            expect(result.withdrawnAmount).toBe(50000);
            expect(apiClient.apiClient.post).toHaveBeenCalledWith('/api/v2/wallet/withdraw', {
                amount: 50000,
                bankCode: '004',
                accountNumber: '1234567890',
            });
        });
    });
});
