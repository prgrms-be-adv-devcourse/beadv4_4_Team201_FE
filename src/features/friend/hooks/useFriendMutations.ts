import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from '@/lib/api/friends';

function useInvalidateFriends() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.friends });
    queryClient.invalidateQueries({ queryKey: queryKeys.friendRequests });
    queryClient.invalidateQueries({ queryKey: queryKeys.sentFriendRequests });
  };
}

export function useSendFriendRequest() {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (receiverId: string) => sendFriendRequest(receiverId),
    onSettled: invalidate,
  });
}

export function useAcceptFriendRequest() {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (friendshipId: string) => acceptFriendRequest(friendshipId),
    onSettled: invalidate,
  });
}

export function useRejectFriendRequest() {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (friendshipId: string) => rejectFriendRequest(friendshipId),
    onSettled: invalidate,
  });
}

export function useRemoveFriend() {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (friendshipId: string) => removeFriend(friendshipId),
    onSettled: invalidate,
  });
}
