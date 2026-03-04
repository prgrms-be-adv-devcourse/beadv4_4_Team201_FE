import { Funding } from '@/types/funding';

export let walletBalance = 1000000;

export interface WalletTransaction {
  id: string;
  type: 'CHARGE' | 'WITHDRAW' | 'PAYMENT';
  amount: number;
  balanceAfter: number;
  description: string;
  relatedId: string | null;
  createdAt: string;
}

export const walletTransactions: WalletTransaction[] = [
  {
    id: 'tx-1',
    type: 'CHARGE',
    amount: 500000,
    balanceAfter: 500000,
    description: '포인트 충전',
    relatedId: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-2',
    type: 'PAYMENT',
    amount: -50000,
    balanceAfter: 450000,
    description: '펀딩 참여',
    relatedId: 'funding-1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-3',
    type: 'CHARGE',
    amount: 600000,
    balanceAfter: 1050000,
    description: '포인트 충전',
    relatedId: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-4',
    type: 'PAYMENT',
    amount: -50000,
    balanceAfter: 1000000,
    description: '펀딩 참여',
    relatedId: 'funding-2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export interface CartItem {
  id: string;
  cartId: string;
  targetType: 'FUNDING' | 'FUNDING_PENDING';
  targetId: number;
  productId: number;
  fundingId: string | null;
  funding: Funding;
  amount: number;
  selected: boolean;
  isNewFunding: boolean;
  createdAt: string;
}

export interface MockFriend {
  id: number;
  friendshipId: number;
  nickname: string;
  avatarUrl: string;
}

export interface MockFriendRequest {
  friendshipId: number;
  requester: {
    id: number;
    nickname: string;
    avatarUrl: string;
  };
  createdAt: string;
}

const GET_STORED_FRIENDS = (): MockFriend[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('mockFriends');
  return stored ? JSON.parse(stored) : [
    { id: 2, friendshipId: 101, nickname: '민수', avatarUrl: 'https://i.pravatar.cc/150?u=member2' },
    { id: 3, friendshipId: 102, nickname: '지영', avatarUrl: 'https://i.pravatar.cc/150?u=member3' },
  ];
};

const GET_STORED_SENT_REQUESTS = (): MockFriendRequest[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('mockSentRequests');
  return stored ? JSON.parse(stored) : [];
};

export let mockFriends = GET_STORED_FRIENDS();
export let mockSentRequests = GET_STORED_SENT_REQUESTS();
export const mockReceivedRequests: MockFriendRequest[] = [];
export let cartItems: CartItem[] = [];

export const setWalletBalance = (balance: number) => {
  walletBalance = balance;
};

export const setMockFriends = (friends: MockFriend[]) => {
  mockFriends = friends;
};

export const setMockSentRequests = (requests: MockFriendRequest[]) => {
  mockSentRequests = requests;
};

export const setCartItems = (items: CartItem[]) => {
  cartItems = items;
};
