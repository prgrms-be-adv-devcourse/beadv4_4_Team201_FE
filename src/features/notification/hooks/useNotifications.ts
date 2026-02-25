import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getNotifications, getUnreadCount } from '@/lib/api/notifications';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { PageParams } from '@/types/api';

export function useNotifications(params: PageParams = { size: 20, sort: 'createdAt,desc' }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: () => getNotifications(params),
    enabled: !!user,
  });
}

export function useUnreadCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.notificationUnreadCount,
    queryFn: getUnreadCount,
    enabled: !!user,
  });
}
