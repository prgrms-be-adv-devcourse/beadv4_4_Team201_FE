import { apiClient } from './client';
import type { Friend, FriendRequest, FriendshipResponse } from '@/types/friend';

// --- Backend DTO Types ---

interface BackendFriendResponse {
  id: number;
  friendshipId?: number;
  nickname: string;
  avatarUrl: string | null;
}

interface BackendFriendRequestResponse {
  friendshipId: number;
  requester: {
    id: number;
    nickname: string;
    avatarUrl: string | null;
  };
  createdAt: string;
}

interface BackendFriendshipResponse {
  id: number;
  requesterId: number;
  receiverId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  acceptedAt: string | null;
}

// --- Mapping ---

function mapFriend(b: BackendFriendResponse): Friend {
  return {
    id: b.id.toString(),
    friendshipId: b.friendshipId?.toString(),
    nickname: b.nickname,
    avatarUrl: b.avatarUrl,
  };
}

function mapFriendRequest(b: BackendFriendRequestResponse): FriendRequest {
  return {
    friendshipId: b.friendshipId.toString(),
    requester: {
      id: b.requester.id.toString(),
      nickname: b.requester.nickname,
      avatarUrl: b.requester.avatarUrl,
    },
    createdAt: b.createdAt,
  };
}

function mapFriendship(b: BackendFriendshipResponse): FriendshipResponse {
  return {
    id: b.id.toString(),
    requesterId: b.requesterId.toString(),
    receiverId: b.receiverId.toString(),
    status: b.status,
    createdAt: b.createdAt,
    acceptedAt: b.acceptedAt,
  };
}

// --- API Functions ---

export async function getMyFriends(): Promise<Friend[]> {
  const response = await apiClient.get<BackendFriendResponse[]>('/api/v2/friends');
  return response.map(mapFriend);
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  const response = await apiClient.get<BackendFriendRequestResponse[]>('/api/v2/friends/requests');
  return response.map(mapFriendRequest);
}

export async function sendFriendRequest(receiverId: string): Promise<FriendshipResponse> {
  const response = await apiClient.post<BackendFriendshipResponse>(
    '/api/v2/friends/request',
    { receiverId: parseInt(receiverId, 10) }
  );
  return mapFriendship(response);
}

export async function acceptFriendRequest(friendshipId: string): Promise<FriendshipResponse> {
  const response = await apiClient.post<BackendFriendshipResponse>(
    `/api/v2/friends/${friendshipId}/accept`,
    {}
  );
  return mapFriendship(response);
}

export async function rejectFriendRequest(friendshipId: string): Promise<void> {
  await apiClient.post<void>(`/api/v2/friends/${friendshipId}/reject`, {});
}

export async function removeFriend(friendshipId: string): Promise<void> {
  await apiClient.delete(`/api/v2/friends/${friendshipId}`);
}
