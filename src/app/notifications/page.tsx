'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { NotificationList } from '@/features/notification/components/NotificationList';
import { useNotifications, useUnreadCount } from '@/features/notification/hooks/useNotifications';
import { useMarkAllAsRead } from '@/features/notification/hooks/useNotificationMutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { InlineError } from '@/components/common/InlineError';
import { EmptyState } from '@/components/common/EmptyState';
import { Bell, Loader2 } from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useNotifications();
  const { data: unreadCount } = useUnreadCount();
  const markAllAsRead = useMarkAllAsRead();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  if (isAuthLoading || isLoading) {
    return (
      <AppShell headerVariant="detail" headerTitle="알림" showBottomNav>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell headerVariant="detail" headerTitle="알림" hasBack showBottomNav>
        <div className="p-8">
          <InlineError
            message="알림을 불러오는데 실패했습니다."
            error={error}
            onRetry={refetch}
          />
        </div>
      </AppShell>
    );
  }

  const items = notifications?.items ?? [];
  const hasUnread = (unreadCount?.count ?? 0) > 0;

  return (
    <AppShell
      headerVariant="detail"
      headerTitle="알림"
      hasBack
      showBottomNav
      headerRight={
        hasUnread ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            모두 읽음
          </Button>
        ) : undefined
      }
    >
      <div className="max-w-screen-md mx-auto">
        {items.length > 0 ? (
          <NotificationList notifications={items} />
        ) : (
          <EmptyState
            icon={<Bell className="h-7 w-7 text-muted-foreground/50" strokeWidth={1} />}
            title="알림이 없습니다"
            description="새로운 알림이 도착하면 여기에 표시됩니다"
            className="py-32"
          />
        )}
      </div>
    </AppShell>
  );
}
