'use client';

import { useRouter } from 'next/navigation';
import { Gift, UserPlus, CreditCard, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarkAsRead } from '../hooks/useNotificationMutations';
import type { Notification, NotificationType } from '@/types/notification';

interface NotificationCardProps {
  notification: Notification;
}

const ICON_MAP: Record<string, typeof Gift> = {
  FUNDING_CREATED: Gift,
  FUNDING_ACHIEVED: Gift,
  FUNDING_EXPIRED: Gift,
  FUNDING_CANCELED: Gift,
  FRIEND_REQUEST_RECEIVED: UserPlus,
  FRIEND_REQUEST_ACCEPTED: UserPlus,
  PAYMENT_SUCCEEDED: CreditCard,
  PAYMENT_FAILED: AlertTriangle,
  PAYMENT_CANCEL_SUCCEEDED: CreditCard,
  PAYMENT_CANCEL_FAILED: AlertTriangle,
};

function getNavigationPath(notification: Notification): string | null {
  if (!notification.referenceId || !notification.referenceType) return null;

  switch (notification.referenceType) {
    case 'FUNDING':
      return `/fundings/${notification.referenceId}`;
    case 'ORDER':
      return `/orders/${notification.referenceId}`;
    case 'FRIENDSHIP':
      return '/friends';
    default:
      return null;
  }
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const router = useRouter();
  const markAsRead = useMarkAsRead();
  const Icon = ICON_MAP[notification.type] || Gift;
  const path = getNavigationPath(notification);

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    if (path) {
      router.push(path);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full text-left flex items-start gap-3 px-4 py-4 border-b border-border transition-colors',
        !notification.isRead && 'border-l-2 border-l-foreground bg-secondary/30',
        notification.isRead && 'opacity-50',
        path && 'cursor-pointer hover:bg-secondary/20',
        !path && 'cursor-default',
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center',
          !notification.isRead ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm leading-snug',
            !notification.isRead ? 'font-medium' : 'font-normal',
          )}
        >
          {notification.title}
        </p>
        {notification.content && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {notification.content}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground mt-1.5 tracking-tight">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}
