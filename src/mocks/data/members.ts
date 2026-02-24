export interface Member {
  id: string;
  authSub: string;
  nickname: string | null;
  email: string;
  avatarUrl: string | null;
  role: 'USER' | 'BUYER' | 'SELLER';
  status: 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';
  birthday?: string;
  address?: string;
  phoneNum?: string;
  createdAt: string;
}

export interface MemberPublic {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
}

export const currentUser: Member = {
  id: 'member-dev',
  authSub: 'auth0|dev-user-123',
  nickname: 'TestUser',
  email: 'developer@giftify.app',
  avatarUrl: 'https://i.pravatar.cc/150?u=dev',
  role: 'SELLER',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
};

export const members: Member[] = [
  currentUser,
  {
    id: 'member-2',
    authSub: 'auth0|234567',
    nickname: '민수',
    email: 'minsu@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=member2',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'member-3',
    authSub: 'auth0|345678',
    nickname: '지영',
    email: 'jiyoung@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=member3',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'member-4',
    authSub: 'auth0|456789',
    nickname: '현우',
    email: 'hyunwoo@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=member4',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    id: 'member-5',
    authSub: 'auth0|567890',
    nickname: '수진',
    email: 'sujin@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=member5',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2024-01-05T00:00:00Z',
  },
];

export const friends: MemberPublic[] = members.slice(1).map((m) => ({
  id: m.id,
  nickname: m.nickname,
  avatarUrl: m.avatarUrl,
}));
