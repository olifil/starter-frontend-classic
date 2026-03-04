import type {
  NotificationPreference,
  PaginatedNotifications,
  PushSubscriptionPayload,
  UpdatePreferencesRequest,
} from '@/core/domain/types/notification.types'

export interface INotificationRepository {
  getUnreadCount(): Promise<number>
  getNotifications(page: number, pageSize: number): Promise<PaginatedNotifications>
  markAsRead(id: string): Promise<void>
  deleteNotification(id: string): Promise<void>
  getPreferences(): Promise<NotificationPreference[]>
  updatePreferences(data: UpdatePreferencesRequest): Promise<NotificationPreference[]>
  getAvailableChannels(): Promise<string[]>
  subscribePush(payload: PushSubscriptionPayload): Promise<void>
  unsubscribePush(endpoint: string): Promise<void>
}
