'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/lib/query/keys';
import { toast } from 'sonner';
import type { CloudEventEnvelope } from '@/types/notification';

const SSE_ENDPOINT = '/api/sse/notifications';
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;
const SSE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes per server spec

const NOTIFICATION_EVENT_TYPES = [
  'app.giftify.notification.funding-created',
  'app.giftify.notification.funding-achieved',
  'app.giftify.notification.funding-expired',
  'app.giftify.notification.funding-canceled',
  'app.giftify.notification.friend-request-received',
  'app.giftify.notification.friend-request-accepted',
  'app.giftify.notification.payment-succeeded',
  'app.giftify.notification.payment-failed',
  'app.giftify.notification.payment-cancel-succeeded',
  'app.giftify.notification.payment-cancel-failed',
] as const;

export function useNotificationSSE() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const invalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount });
  }, [queryClient]);

  const handleNotificationEvent = useCallback(
    (event: MessageEvent) => {
      try {
        const cloudEvent: CloudEventEnvelope = JSON.parse(event.data);
        if (cloudEvent.data) {
          toast(cloudEvent.data.title, {
            description: cloudEvent.data.content,
            action: {
              label: '확인',
              onClick: () => {
                window.location.href = '/notifications';
              },
            },
          });
        }
        invalidateNotifications();
      } catch {
        // ignore malformed events
      }
    },
    [invalidateNotifications],
  );

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }

    const es = new EventSource(SSE_ENDPOINT);
    eventSourceRef.current = es;

    es.addEventListener('connect', () => {
      reconnectAttempts.current = 0;

      // Server closes connection after 30 minutes; reconnect before that
      timeoutTimerRef.current = setTimeout(() => {
        es.close();
        eventSourceRef.current = null;
        reconnectAttempts.current = 0;
        connect();
      }, SSE_TIMEOUT_MS);
    });

    NOTIFICATION_EVENT_TYPES.forEach((type) => {
      es.addEventListener(type, handleNotificationEvent);
    });

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };
  }, [handleNotificationEvent]);

  useEffect(() => {
    if (!user) return;

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [user, connect]);
}
