import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getMyFriends, getFriendRequests } from '@/lib/api/friends';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useMyFriends() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.friends,
    queryFn: getMyFriends,
    enabled: !!user,
  });
}

export function useFriendRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.friendRequests,
    queryFn: getFriendRequests,
    enabled: !!user,
  });
}
