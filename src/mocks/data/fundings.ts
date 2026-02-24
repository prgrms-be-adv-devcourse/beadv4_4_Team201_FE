import { members } from './members';
import { products } from './products';
import { Funding, FundingParticipant, FundingStatus } from '@/types/funding';
import { Product } from '@/types/product';
import { MemberPublic } from '@/types/member';

export type { FundingStatus };

// Interfaces are now imported from @/types/funding

const now = new Date();
const futureDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
const pastDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

export const fundings: Funding[] = [
  {
    id: 'funding-1',
    wishItemId: 'wish-item-1',
    product: products[0],
    organizerId: members[0].id,
    organizer: {
      id: members[0].id,
      nickname: members[0].nickname,
      avatarUrl: members[0].avatarUrl,
    },
    recipientId: members[1].id,
    recipient: {
      id: members[1].id,
      nickname: members[1].nickname,
      avatarUrl: members[1].avatarUrl,
    },
    targetAmount: products[0].price,
    currentAmount: 200000,
    status: 'IN_PROGRESS',
    participantCount: 5,
    expiresAt: futureDate.toISOString(),
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'funding-2',
    wishItemId: 'wish-item-2',
    product: products[1],
    organizerId: members[1].id,
    organizer: {
      id: members[1].id,
      nickname: members[1].nickname,
      avatarUrl: members[1].avatarUrl,
    },
    recipientId: members[0].id,
    recipient: {
      id: members[0].id,
      nickname: members[0].nickname,
      avatarUrl: members[0].avatarUrl,
    },
    targetAmount: products[1].price,
    currentAmount: 359000,
    status: 'ACHIEVED',
    participantCount: 8,
    expiresAt: futureDate.toISOString(),
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'funding-3',
    wishItemId: 'wish-item-3',
    product: products[2],
    organizerId: members[2].id,
    organizer: {
      id: members[2].id,
      nickname: members[2].nickname,
      avatarUrl: members[2].avatarUrl,
    },
    recipientId: members[3].id,
    recipient: {
      id: members[3].id,
      nickname: members[3].nickname,
      avatarUrl: members[3].avatarUrl,
    },
    targetAmount: products[2].price,
    currentAmount: 500000,
    status: 'IN_PROGRESS',
    participantCount: 12,
    expiresAt: futureDate.toISOString(),
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'funding-4',
    wishItemId: 'wish-item-4',
    product: products[3],
    organizerId: members[0].id,
    organizer: {
      id: members[0].id,
      nickname: members[0].nickname,
      avatarUrl: members[0].avatarUrl,
    },
    recipientId: members[2].id,
    recipient: {
      id: members[2].id,
      nickname: members[2].nickname,
      avatarUrl: members[2].avatarUrl,
    },
    targetAmount: products[3].price,
    currentAmount: 100000,
    status: 'IN_PROGRESS',
    participantCount: 3,
    expiresAt: futureDate.toISOString(),
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'funding-5',
    wishItemId: 'wish-item-5',
    product: products[4],
    organizerId: members[3].id,
    organizer: {
      id: members[3].id,
      nickname: members[3].nickname,
      avatarUrl: members[3].avatarUrl,
    },
    recipientId: members[4].id,
    recipient: {
      id: members[4].id,
      nickname: members[4].nickname,
      avatarUrl: members[4].avatarUrl,
    },
    targetAmount: products[4].price,
    currentAmount: 439000,
    status: 'ACCEPTED',
    participantCount: 6,
    expiresAt: pastDate.toISOString(),
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const fundingParticipants: Record<string, FundingParticipant[]> = {
  'funding-1': [
    {
      id: 'participant-1-1',
      fundingId: 'funding-1',
      memberId: members[0].id,
      member: {
        id: members[0].id,
        nickname: members[0].nickname,
        avatarUrl: members[0].avatarUrl,
      },
      amount: 100000,
      isOrganizer: true,
      participatedAt: new Date(
        now.getTime() - 5 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 'participant-1-2',
      fundingId: 'funding-1',
      memberId: members[2].id,
      member: {
        id: members[2].id,
        nickname: members[2].nickname,
        avatarUrl: members[2].avatarUrl,
      },
      amount: 50000,
      isOrganizer: false,
      participatedAt: new Date(
        now.getTime() - 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 'participant-1-3',
      fundingId: 'funding-1',
      memberId: members[3].id,
      member: {
        id: members[3].id,
        nickname: members[3].nickname,
        avatarUrl: members[3].avatarUrl,
      },
      amount: 30000,
      isOrganizer: false,
      participatedAt: new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 'participant-1-4',
      fundingId: 'funding-1',
      memberId: members[4].id,
      member: {
        id: members[4].id,
        nickname: members[4].nickname,
        avatarUrl: members[4].avatarUrl,
      },
      amount: 20000,
      isOrganizer: false,
      participatedAt: new Date(
        now.getTime() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  ],
  'funding-2': [
    {
      id: 'participant-2-1',
      fundingId: 'funding-2',
      memberId: members[1].id,
      member: {
        id: members[1].id,
        nickname: members[1].nickname,
        avatarUrl: members[1].avatarUrl,
      },
      amount: 150000,
      isOrganizer: true,
      participatedAt: new Date(
        now.getTime() - 10 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 'participant-2-2',
      fundingId: 'funding-2',
      memberId: members[0].id,
      member: {
        id: members[0].id,
        nickname: members[0].nickname,
        avatarUrl: members[0].avatarUrl,
      },
      amount: 100000,
      isOrganizer: false,
      participatedAt: new Date(
        now.getTime() - 9 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  ],
};



export const myParticipatedFundings = fundings.filter((f) =>
  fundingParticipants[f.id]?.some((p) => p.memberId === members[0].id)
);

export const myReceivedFundings = fundings.filter(
  (f) => f.recipientId === members[0].id
);
