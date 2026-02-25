'use client';

import { isToday, isYesterday, isThisWeek } from 'date-fns';
import { NotificationCard } from './NotificationCard';
import type { Notification } from '@/types/notification';

interface NotificationListProps {
  notifications: Notification[];
}

interface DateGroup {
  label: string;
  items: Notification[];
}

function groupByDate(notifications: Notification[]): DateGroup[] {
  const groups: Record<string, Notification[]> = {};
  const order: string[] = [];

  for (const n of notifications) {
    const date = new Date(n.createdAt);
    let label: string;

    if (isToday(date)) {
      label = '오늘';
    } else if (isYesterday(date)) {
      label = '어제';
    } else if (isThisWeek(date)) {
      label = '이번 주';
    } else {
      label = '이전';
    }

    if (!groups[label]) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(n);
  }

  return order.map((label) => ({ label, items: groups[label] }));
}

export function NotificationList({ notifications }: NotificationListProps) {
  const groups = groupByDate(notifications);

  return (
    <div>
      {groups.map((group) => (
        <section key={group.label}>
          <div className="sticky top-14 z-10 bg-background/95 backdrop-blur-sm px-4 py-2 border-b border-border">
            <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              {group.label}
            </span>
          </div>
          {group.items.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </section>
      ))}
    </div>
  );
}
