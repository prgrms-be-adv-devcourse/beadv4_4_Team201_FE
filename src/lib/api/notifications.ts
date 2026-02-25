import { apiClient } from './client';
import { mapSpringPage, type SpringPage } from './pagination';
import type { Notification, UnreadCount } from '@/types/notification';
import type { PaginatedResponse, PageParams } from '@/types/api';

export async function getNotifications(
  params: PageParams = {},
): Promise<PaginatedResponse<Notification>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.size !== undefined) searchParams.set('size', String(params.size));
  if (params.sort) searchParams.set('sort', params.sort);

  const query = searchParams.toString();
  const response = await apiClient.get<SpringPage<Notification>>(
    `/api/v1/notifications${query ? `?${query}` : ''}`,
  );
  return mapSpringPage(response);
}

export async function getUnreadNotifications(
  params: PageParams = {},
): Promise<PaginatedResponse<Notification>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.size !== undefined) searchParams.set('size', String(params.size));
  if (params.sort) searchParams.set('sort', params.sort);

  const query = searchParams.toString();
  const response = await apiClient.get<SpringPage<Notification>>(
    `/api/v1/notifications/unread${query ? `?${query}` : ''}`,
  );
  return mapSpringPage(response);
}

export async function getUnreadCount(): Promise<UnreadCount> {
  return apiClient.get<UnreadCount>('/api/v1/notifications/unread/count');
}

export async function markAsRead(notificationId: number): Promise<void> {
  await apiClient.patch<void>(`/api/v1/notifications/${notificationId}/read`, {});
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch<void>('/api/v1/notifications/read-all', {});
}
