import { Funding } from './funding';

/**
 * Cart item availability status
 */
export type ItemStatus = 'AVAILABLE' | 'SOLD_OUT' | 'DISCONTINUED' | 'FUNDING_ENDED';

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
    id: string; // Composite key: cartId::targetType::targetId
    cartId: string;
    targetType: 'FUNDING' | 'FUNDING_PENDING';
    targetId: string;
    wishlistId: string | null;
    receiverId: string | null;
    receiverNickname: string | null;
    imageKey: string | null;
    productName: string | null;
    productPrice: number;
    contributionAmount: number;
    currentAmount: number | null;
    amount: number; // For backward compatibility / UI consistency
    fundingId: string | null; // New field for navigation to funding
    productId: string; // Required for navigation to product (provided directly by backend V2 API)
    funding: Funding; // Always present for funding types
    selected: boolean;
    isNewFunding: boolean;
    createdAt: string;
    status: ItemStatus;
    statusMessage?: string | null;
}

export interface CartItemCreateRequest {
    targetId: string | number;
    amount: number;
}

/**
 * Request body for updating a cart item
 */
export interface CartItemUpdateRequest {
    amount?: number;
    selected?: boolean;
    wishlistId?: string | number;
}
