'use client';

import { useNotificationSSE } from '../hooks/useNotificationSSE';

export function NotificationSSEProvider() {
  useNotificationSSE();
  return null;
}
