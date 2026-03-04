export interface Notification {
  id: string
  userId: string
  type: string
  channel: NotificationType
  status: NotificationStatus
  subject?: string
  body: string
  sentAt?: string
  readAt?: string
  createdAt: string
}

export interface NotificationMeta {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedNotifications {
  data: Notification[]
  meta: NotificationMeta
}

export enum NotificationPageSize {
  Small = 10,
  Medium = 25,
  Large = 50,
  Default = NotificationPageSize.Small,
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
  WEBPUSH = 'WEBPUSH',
  WEBSOCKET = 'WEBSOCKET',
}

export enum NotificationStatus {
  SENT = 'SENT',
  READ = 'READ',
  FAILED = 'FAILED',
}

export interface NotificationPreference {
  id: string
  channel: string
  enabled: boolean
}

export interface UpdatePreferencesRequest {
  preferences: { channel: string; enabled: boolean }[]
}

export interface PushSubscriptionPayload {
  endpoint: string
  p256dh: string
  auth: string
}
