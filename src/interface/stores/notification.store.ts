import { NotificationHttpAdapter } from '@/infrastructure/adapters/http/notification.http-adapter'
import {
  NotificationWsAdapter,
  type NotificationWsPayload,
} from '@/infrastructure/adapters/websocket/notification.ws-adapter'
import { WebPushAdapter } from '@/infrastructure/adapters/webpush/webpush.adapter'
import type {
  NotificationPreference,
  PaginatedNotifications,
  UpdatePreferencesRequest,
} from '@/core/domain/types/notification.types'
import { useAuthStore } from './auth.store'

const httpAdapter = new NotificationHttpAdapter()
const wsAdapter = new NotificationWsAdapter()
const webPushAdapter = new WebPushAdapter(httpAdapter)

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)
  const lastNotification = ref<NotificationWsPayload | null>(null)
  const notifications = ref<PaginatedNotifications | null>(null)
  const preferences = ref<NotificationPreference[]>([])
  const availableChannels = ref<string[]>([])
  const { isAuthenticated, accessToken } = storeToRefs(useAuthStore())

  async function fetchUnreadCount() {
    try {
      unreadCount.value = await httpAdapter.getUnreadCount()
    } catch {
      // silently fail — ne pas perturber l'UI si le fetch échoue
    }
  }

  async function getNotifications(page: number, pageSize: number) {
    notifications.value = await httpAdapter.getNotifications(page, pageSize)
  }

  function connect(token: string) {
    wsAdapter.connect(token, (payload: NotificationWsPayload) => {
      unreadCount.value++
      lastNotification.value = payload
    })
    fetchUnreadCount()
  }

  function disconnect() {
    wsAdapter.disconnect()
    unreadCount.value = 0
  }

  async function markAsRead(id: string) {
    await httpAdapter.markAsRead(id)
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  async function deleteNotification(id: string, wasUnread: boolean) {
    await httpAdapter.deleteNotification(id)
    if (wasUnread) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function getPreferences() {
    preferences.value = await httpAdapter.getPreferences()
    await syncWebPushSubscription()
  }

  async function syncWebPushSubscription() {
    const isEnabled = preferences.value.some((p) => p.channel === 'WEB_PUSH' && p.enabled)
    if (!isEnabled) return
    try {
      await webPushAdapter.syncSubscription()
    } catch {
      // échec silencieux — ne pas perturber l'UI
    }
  }

  async function updatePreferences(data: UpdatePreferencesRequest) {
    preferences.value = await httpAdapter.updatePreferences(data)
  }

  async function getAvailableChannels() {
    availableChannels.value = await httpAdapter.getAvailableChannels()
  }

  async function subscribePush() {
    await webPushAdapter.subscribe()
  }

  watch(
    [isAuthenticated, accessToken],
    ([authenticated, token]) => {
      if (authenticated && token) {
        connect(token)
      } else {
        disconnect()
      }
    },
    { immediate: true },
  )

  return {
    unreadCount,
    lastNotification,
    notifications,
    preferences,
    availableChannels,
    fetchUnreadCount,
    getNotifications,
    markAsRead,
    deleteNotification,
    getPreferences,
    updatePreferences,
    getAvailableChannels,
    subscribePush,
  }
})
