import { HttpAdapter } from './http-adapter'
import type { INotificationRepository } from '@/core/domain/ports/notification.repository'
import {
  NotificationStatus,
  NotificationType,
  type NotificationPreference,
  type PaginatedNotifications,
  type PushSubscriptionPayload,
  type UpdatePreferencesRequest,
} from '@/core/domain/types/notification.types'

export class NotificationHttpAdapter
  extends HttpAdapter
  implements INotificationRepository
{
  constructor() {
    super('notifications')
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.get<{ count: number }>('/unread-count', {
      channel: NotificationType.WEBSOCKET,
      status: NotificationStatus.SENT,
    })
    return response.count ?? 0
  }

  async getNotifications(
    page: number,
    pageSize: number,
  ): Promise<PaginatedNotifications> {
    return this.get<PaginatedNotifications>('/', {
      channel: NotificationType.WEBSOCKET,
      page,
      pageSize,
    })
  }

  async markAsRead(id: string): Promise<void> {
    await this.patch('/read', undefined, { id, channel: NotificationType.WEBSOCKET })
  }

  async deleteNotification(id: string): Promise<void> {
    await this.delete(`/${id}`)
  }

  async getPreferences(): Promise<NotificationPreference[]> {
    return this.get<NotificationPreference[]>('/preferences')
  }

  async updatePreferences(data: UpdatePreferencesRequest): Promise<NotificationPreference[]> {
    return this.put<NotificationPreference[]>('/preferences', data)
  }

  async getAvailableChannels(): Promise<string[]> {
    const response = await this.get<{ channels: string[] }>('/channels')
    return response.channels
  }

  async subscribePush(payload: PushSubscriptionPayload): Promise<void> {
    await this.post('/push-subscriptions', payload)
  }

  async unsubscribePush(endpoint: string): Promise<void> {
    await this.delete('/push-subscriptions', { endpoint })
  }
}
