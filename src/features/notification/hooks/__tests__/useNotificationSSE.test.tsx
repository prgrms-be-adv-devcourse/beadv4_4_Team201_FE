import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

type EventListener = (...args: unknown[]) => void;

const mockToast = vi.fn();
vi.mock('sonner', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  listeners: Record<string, EventListener[]> = {};
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: EventListener) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  emit(type: string, data: unknown) {
    this.listeners[type]?.forEach((fn) => fn(data));
  }

  set onerror(_fn: EventListener) {}
}

vi.stubGlobal('EventSource', MockEventSource);

import { useNotificationSSE } from '../useNotificationSSE';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useNotificationSSE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MockEventSource.instances = [];
  });

  it('GIVEN notification received, THEN toast action should use router.push', () => {
    renderHook(() => useNotificationSSE(), { wrapper: TestWrapper });

    const es = MockEventSource.instances[0];
    expect(es).toBeDefined();
    expect(es.url).toBe('/api/sse/notifications');

    es.emit('connect', {});

    const notificationEvent = {
      data: JSON.stringify({
        type: 'app.giftify.notification.funding-created',
        data: {
          title: '새 펀딩',
          content: '테스트 펀딩이 생성되었습니다',
        },
      }),
    };

    es.emit('app.giftify.notification.funding-created', notificationEvent);

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      '새 펀딩',
      expect.objectContaining({
        description: '테스트 펀딩이 생성되었습니다',
        action: expect.objectContaining({
          label: '확인',
          onClick: expect.any(Function),
        }),
      }),
    );

    const toastCall = mockToast.mock.calls[0];
    const action = toastCall[1].action;
    action.onClick();

    expect(mockPush).toHaveBeenCalledWith('/notifications');
  });

  it('GIVEN multiple notification types, THEN all should trigger toast with router.push action', () => {
    renderHook(() => useNotificationSSE(), { wrapper: TestWrapper });

    const es = MockEventSource.instances[0];
    es.emit('connect', {});

    const eventTypes = [
      'app.giftify.notification.funding-created',
      'app.giftify.notification.friend-request-received',
      'app.giftify.notification.payment-succeeded',
    ];

    eventTypes.forEach((type, index) => {
      es.emit(type, {
        data: JSON.stringify({
          type,
          data: { title: `알림 ${index + 1}`, content: `내용 ${index + 1}` },
        }),
      });
    });

    expect(mockToast).toHaveBeenCalledTimes(3);

    mockToast.mock.calls.forEach((call) => {
      const action = call[1].action;
      expect(action.label).toBe('확인');
      expect(typeof action.onClick).toBe('function');
    });
  });
});
