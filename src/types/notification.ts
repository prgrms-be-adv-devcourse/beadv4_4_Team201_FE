export type NotificationType =
  | 'FUNDING_CREATED'
  | 'FUNDING_ACHIEVED'
  | 'FUNDING_EXPIRED'
  | 'FUNDING_CANCELED'
  | 'FRIEND_REQUEST_RECEIVED'
  | 'FRIEND_REQUEST_ACCEPTED'
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_CANCEL_SUCCEEDED'
  | 'PAYMENT_CANCEL_FAILED';

export type ReferenceType = 'FUNDING' | 'ORDER' | 'FRIENDSHIP';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}

export interface CloudEventEnvelope {
  specVersion: string;
  id: string;
  source: string;
  type: string;
  subject: string;
  time: string;
  dataContentType: string | null;
  data: NotificationEventData | null;
}

export interface NotificationEventData {
  notificationId: number;
  title: string;
  content: string;
  isRead: boolean;
  referenceId: string | null;
  referenceType: string | null;
}
