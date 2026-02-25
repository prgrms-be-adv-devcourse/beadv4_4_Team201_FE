import { MemberPublic } from './member';
import { Product } from './product';
import { PageInfo } from './api';

/**
 * Wishlist visibility settings
 * - PUBLIC: Visible to everyone
 * - FRIENDS_ONLY: Visible to friends only
 * - PRIVATE: Visible only to owner
 */
export type WishlistVisibility = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';

/**
 * Wish item status
 * - PENDING: Not yet started
 * - IN_PROGRESS: Funding in progress
 * - REQUESTED_CONFIRM: Awaiting recipient acceptance
 * - COMPLETED: Funding accepted/completed
 */
export type WishItemStatus = 'PENDING' | 'IN_PROGRESS' | 'REQUESTED_CONFIRM' | 'COMPLETED';

/**
 * Wish item in a wishlist
 */
export interface WishItem {
    id: string;
    wishlistId: string;
    productId: string;
    product: Product;
    status: WishItemStatus;
    fundingId: string | null;
    createdAt: string;
}

/**
 * Member's wishlist with items
 */
export interface Wishlist {
    id: string;
    memberId: string;
    member: MemberPublic;
    visibility: WishlistVisibility;
    items: WishItem[];
    itemCount: number;
    page?: PageInfo;
}

/**
 * Request body for creating a wish item
 */
export interface WishItemCreateRequest {
    productId: string;
}

/**
 * Friend's wishlist with preview items
 */
export interface FriendWishlistItem {
    member: MemberPublic;
    wishlist: Wishlist;
    previewItems: WishItem[];
}

/**
 * Response for friends' wishlists
 */
export interface FriendWishlistListResponse {
    items: FriendWishlistItem[];
}

export interface PublicWishlistSummary {
    memberId: string;
    nickname: string;
}

export interface PublicWishlistItem {
    wishlistItemId: string;
    productId: string;
    productName: string;
    price: number;
    addedAt: string;
}

export interface PublicWishlist {
    memberId: string;
    nickname: string;
    items: PublicWishlistItem[];
}

/**
 * Query parameters for wishlist list
 */
export interface WishlistQueryParams {
    category?: string;
    status?: WishItemStatus | '';
    page?: number;
    size?: number;
}
