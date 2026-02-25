import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { markAsRead, markAllAsRead } from '@/lib/api/notifications';

function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount });
  };
}

export function useMarkAsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (notificationId: number) => markAsRead(notificationId),
    onSettled: invalidate,
  });
}

export function useMarkAllAsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSettled: invalidate,
  });
}
