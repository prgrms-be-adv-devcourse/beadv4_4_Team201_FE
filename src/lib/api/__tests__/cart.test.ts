import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCart, addCartItem, updateCartItem, removeCartItem, parseCartItemId } from '../cart';
import * as apiClient from '../client';

vi.mock('../client');

describe('cart API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCart', () => {
        it('GIVEN backend returns cart data, THEN it should map to frontend structure', async () => {
            const mockBackendResponse = {
                cartId: 1,
                memberId: 1,
                items: [
                    {
                        targetType: 'FUNDING',
                        targetId: 10,
                        receiverId: 2,
                        receiverNickname: 'John',
                        productName: 'Test Product',
                        productId: 5,
                        imageKey: 'test-key',
                        productPrice: 10000,
                        contributionAmount: 10000,
                        currentAmount: 5000,
                        fundingId: 15,
                        status: 'AVAILABLE',
                        statusMessage: null,
                    },
                ],
                totalAmount: 10000,
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockBackendResponse);

            const result = await getCart();

            expect(result.id).toBe('1');
            expect(result.memberId).toBe('1');
            expect(result.items).toHaveLength(1);
            expect(result.items[0].productName).toBe('Test Product');
            expect(result.items[0].selected).toBe(true); // AVAILABLE items should be selected
        });
    });

    describe('addCartItem', () => {
        it('GIVEN cart item data, THEN it should POST to cart endpoint', async () => {
            const mockPost = vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(undefined);

            await addCartItem({
                targetId: '10',
                amount: 5000,
            });

            expect(mockPost).toHaveBeenCalledWith('/api/v2/carts', {
                targetId: 10,
                amount: 5000,
            });
        });
    });

    describe('parseCartItemId', () => {
        it('GIVEN composite cart item ID, THEN it should parse correctly', () => {
            const result = parseCartItemId('1::FUNDING::10');

            expect(result.targetType).toBe('FUNDING');
            expect(result.targetId).toBe(10);
        });
    });
});
