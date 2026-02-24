'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '../hooks/useNotifications';

interface NotificationBellProps {
  className?: string;
  iconSize?: string;
  strokeWidth?: number;
}

export function NotificationBell({
  className,
  iconSize = 'h-6 w-6',
  strokeWidth = 1.5,
}: NotificationBellProps) {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <Link href="/notifications" className={className}>
      <div className="relative">
        <Bell className={iconSize} strokeWidth={strokeWidth} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] text-background font-medium">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </Link>
  );
}
