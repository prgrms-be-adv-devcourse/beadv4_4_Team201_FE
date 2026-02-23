export interface Friend {
  id: string;
  friendshipId?: string;
  nickname: string;
  avatarUrl: string | null;
}

export interface FriendRequest {
  friendshipId: string;
  requester: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
  };
  createdAt: string;
}

export interface FriendshipResponse {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  acceptedAt: string | null;
}
