import { members } from './members';
import { products } from './products';

export type WishlistVisibility = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';

export type WishItemStatus = 'AVAILABLE' | 'IN_FUNDING' | 'FUNDED';

export interface WishItem {
  id: string;
  wishlistId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    status: 'PENDING' | 'ON_SALE' | 'REJECTED' | 'DISCONTINUED';
  };
  status: WishItemStatus;
  fundingId: string | null;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  memberId: string;
  member: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
  visibility: WishlistVisibility;
  items: WishItem[];
  itemCount: number;
}

const now = new Date();

export const myWishlist: Wishlist = {
  id: 'wishlist-1',
  memberId: members[0].id,
  member: {
    id: members[0].id,
    nickname: members[0].nickname,
    avatarUrl: members[0].avatarUrl,
  },
  visibility: 'PUBLIC',
  items: [
    {
      id: 'wish-item-1',
      wishlistId: 'wishlist-1',
      productId: products[0].id,
      product: products[0],
      status: 'AVAILABLE',
      fundingId: null,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'wish-item-2',
      wishlistId: 'wishlist-1',
      productId: products[1].id,
      product: products[1],
      status: 'IN_FUNDING',
      fundingId: 'funding-2',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'wish-item-3',
      wishlistId: 'wishlist-1',
      productId: products[5].id,
      product: products[5],
      status: 'AVAILABLE',
      fundingId: null,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  itemCount: 3,
};

export const friendsWishlists: Wishlist[] = [
  {
    id: 'wishlist-2',
    memberId: members[1].id,
    member: {
      id: members[1].id,
      nickname: members[1].nickname,
      avatarUrl: members[1].avatarUrl,
    },
    visibility: 'PUBLIC',
    items: [
      {
        id: 'wish-item-4',
        wishlistId: 'wishlist-2',
        productId: products[2].id,
        product: products[2],
        status: 'AVAILABLE',
        fundingId: null,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'wish-item-5',
        wishlistId: 'wishlist-2',
        productId: products[3].id,
        product: products[3],
        status: 'IN_FUNDING',
        fundingId: 'funding-1',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'wish-item-6',
        wishlistId: 'wishlist-2',
        productId: products[4].id,
        product: products[4],
        status: 'AVAILABLE',
        fundingId: null,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    itemCount: 3,
  },
  {
    id: 'wishlist-3',
    memberId: members[2].id,
    member: {
      id: members[2].id,
      nickname: members[2].nickname,
      avatarUrl: members[2].avatarUrl,
    },
    visibility: 'FRIENDS_ONLY',
    items: [
      {
        id: 'wish-item-7',
        wishlistId: 'wishlist-3',
        productId: products[6].id,
        product: products[6],
        status: 'AVAILABLE',
        fundingId: null,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'wish-item-8',
        wishlistId: 'wishlist-3',
        productId: products[7].id,
        product: products[7],
        status: 'AVAILABLE',
        fundingId: null,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    itemCount: 2,
  },
  {
    id: 'wishlist-4',
    memberId: members[3].id,
    member: {
      id: members[3].id,
      nickname: members[3].nickname,
      avatarUrl: members[3].avatarUrl,
    },
    visibility: 'PUBLIC',
    items: [
      {
        id: 'wish-item-9',
        wishlistId: 'wishlist-4',
        productId: products[8].id,
        product: products[8],
        status: 'AVAILABLE',
        fundingId: null,
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    itemCount: 1,
  },
  {
    id: 'wishlist-5',
    memberId: members[4].id,
    member: {
      id: members[4].id,
      nickname: members[4].nickname,
      avatarUrl: members[4].avatarUrl,
    },
    visibility: 'PUBLIC',
    items: [
      {
        id: 'wish-item-10',
        wishlistId: 'wishlist-5',
        productId: products[9].id,
        product: products[9],
        status: 'AVAILABLE',
        fundingId: null,
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'wish-item-11',
        wishlistId: 'wishlist-5',
        productId: products[0].id,
        product: products[0],
        status: 'AVAILABLE',
        fundingId: null,
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    itemCount: 2,
  },
];

export const wishlists: Wishlist[] = [myWishlist, ...friendsWishlists];
