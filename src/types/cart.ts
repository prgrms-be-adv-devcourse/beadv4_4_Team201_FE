import { Funding } from './funding';

/**
 * Shopping cart containing funding participation items
 */
export interface Cart {
    id: string;
    memberId: string;
    items: CartItem[];
    selectedCount: number;
    totalAmount: number;
}

/**
 * Cart item representing a funding participation
 */
export interface CartItem {
    id: string;
    cartId: string;
    fundingId: string;
    receiverId: number;
    funding: Funding;
    amount: number;
    selected: boolean;
    isNewFunding: boolean;
    createdAt: string;
}

/**
 * Request body for creating a cart item
 * - For funding: provide fundingId or wishItemId with amount
 * - For product: provide productId with quantity
 */
export interface CartItemCreateRequest {
    // Funding related
    fundingId?: string;
    wishItemId?: string;
    amount?: number;
    // Product related
    productId?: string;
    quantity?: number;
}

/**
 * Request body for updating a cart item
 */
export interface CartItemUpdateRequest {
    amount?: number;
    selected?: boolean;
}
