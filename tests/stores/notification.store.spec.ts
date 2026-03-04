import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import { ref, nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'

const { mockGetUnreadCount, mockGetNotifications, mockMarkAsRead, mockDeleteNotification, mockGetPreferences, mockUpdatePreferences, mockGetAvailableChannels, mockWsConnect, mockWsDisconnect, mockWebPushSubscribe, mockWebPushUnsubscribe, mockWebPushSyncSubscription } = vi.hoisted(() => ({
  mockGetUnreadCount: vi.fn(),
  mockGetNotifications: vi.fn(),
  mockMarkAsRead: vi.fn(),
  mockDeleteNotification: vi.fn(),
  mockGetPreferences: vi.fn(),
  mockUpdatePreferences: vi.fn(),
  mockGetAvailableChannels: vi.fn(),
  mockWsConnect: vi.fn(),
  mockWsDisconnect: vi.fn(),
  mockWebPushSubscribe: vi.fn(),
  mockWebPushUnsubscribe: vi.fn(),
  mockWebPushSyncSubscription: vi.fn(),
}))

const isAuthenticated = ref(false)
const accessToken = ref<string | null>(null)

vi.mock('@/infrastructure/adapters/http/notification.http-adapter', () => ({
  NotificationHttpAdapter: vi.fn(function () {
    return { getUnreadCount: mockGetUnreadCount, getNotifications: mockGetNotifications, markAsRead: mockMarkAsRead, deleteNotification: mockDeleteNotification, getPreferences: mockGetPreferences, updatePreferences: mockUpdatePreferences, getAvailableChannels: mockGetAvailableChannels, subscribePush: vi.fn(), unsubscribePush: vi.fn() }
  }),
}))

vi.mock('@/infrastructure/adapters/webpush/webpush.adapter', () => ({
  WebPushAdapter: vi.fn(function () {
    return { subscribe: mockWebPushSubscribe, unsubscribe: mockWebPushUnsubscribe, syncSubscription: mockWebPushSyncSubscription }
  }),
}))

vi.mock('@/infrastructure/adapters/websocket/notification.ws-adapter', () => ({
  NotificationWsAdapter: vi.fn(function () {
    return { connect: mockWsConnect, disconnect: mockWsDisconnect }
  }),
}))

vi.mock('@/interface/stores/auth.store', () => ({
  useAuthStore: () => ({ isAuthenticated, accessToken }),
}))

import { useNotificationStore } from '@/interface/stores/notification.store'

describe('useNotificationStore', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
    isAuthenticated.value = false
    accessToken.value = null
  })

  afterEach(() => {
    // Stop the pinia effect scope to dispose all store watchers between tests
    ;(pinia as unknown as { _e: { stop: () => void } })._e.stop()
  })

  describe('initial state', () => {
    it('has unreadCount of 0', () => {
      const store = useNotificationStore()
      expect(store.unreadCount).toBe(0)
    })

    it('has notifications as null', () => {
      const store = useNotificationStore()
      expect(store.notifications).toBeNull()
    })
  })

  describe('getNotifications', () => {
    it('stores the paginated result in notifications', async () => {
      const data = {
        data: [],
        meta: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      }
      mockGetNotifications.mockResolvedValueOnce(data)
      const store = useNotificationStore()
      await store.getNotifications(1, 10)
      expect(store.notifications).toEqual(data)
    })

    it('calls the adapter with the given page and page size', async () => {
      mockGetNotifications.mockResolvedValueOnce({ data: [], meta: {} })
      const store = useNotificationStore()
      await store.getNotifications(2, 5)
      expect(mockGetNotifications).toHaveBeenCalledWith(2, 5)
    })
  })

  describe('watcher — unauthenticated (immediate)', () => {
    it('does not connect', () => {
      useNotificationStore()
      expect(mockWsConnect).not.toHaveBeenCalled()
    })

    it('calls disconnect', () => {
      useNotificationStore()
      expect(mockWsDisconnect).toHaveBeenCalled()
    })
  })

  describe('watcher — authenticated (immediate)', () => {
    it('connects with the access token', () => {
      isAuthenticated.value = true
      accessToken.value = 'test-token'
      useNotificationStore()
      expect(mockWsConnect).toHaveBeenCalledWith('test-token', expect.any(Function))
    })

    it('fetches unread count on connect', async () => {
      mockGetUnreadCount.mockResolvedValueOnce(4)
      isAuthenticated.value = true
      accessToken.value = 'test-token'
      const store = useNotificationStore()
      await flushPromises()
      expect(store.unreadCount).toBe(4)
    })
  })

  describe('watcher — auth state change', () => {
    it('connects when auth becomes true', async () => {
      useNotificationStore()
      isAuthenticated.value = true
      accessToken.value = 'new-token'
      await nextTick()
      expect(mockWsConnect).toHaveBeenCalledWith('new-token', expect.any(Function))
    })

    it('disconnects when auth becomes false', async () => {
      isAuthenticated.value = true
      accessToken.value = 'test-token'
      useNotificationStore()
      vi.clearAllMocks()

      isAuthenticated.value = false
      accessToken.value = null
      await nextTick()
      expect(mockWsDisconnect).toHaveBeenCalled()
    })

    it('resets unreadCount on disconnect', async () => {
      mockGetUnreadCount.mockResolvedValueOnce(5)
      isAuthenticated.value = true
      accessToken.value = 'test-token'
      const store = useNotificationStore()
      await flushPromises()
      expect(store.unreadCount).toBe(5)

      isAuthenticated.value = false
      accessToken.value = null
      await nextTick()
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('WS notification', () => {
    it('increments unreadCount on each received notification', async () => {
      mockGetUnreadCount.mockResolvedValueOnce(2)
      isAuthenticated.value = true
      accessToken.value = 'test-token'
      const store = useNotificationStore()
      await flushPromises()

      const onNotification = mockWsConnect.mock.calls[0]![1] as (payload: {
        body: string
      }) => void
      onNotification({ body: 'msg 1' })
      expect(store.unreadCount).toBe(3)
      onNotification({ body: 'msg 2' })
      expect(store.unreadCount).toBe(4)
    })

    it('stores the last received payload in lastNotification', async () => {
      isAuthenticated.value = true
      accessToken.value = 'test-token'
      const store = useNotificationStore()

      const onNotification = mockWsConnect.mock.calls[0]![1] as (payload: {
        subject?: string
        body: string
      }) => void
      const payload = { subject: 'Hello', body: 'World' }
      onNotification(payload)

      expect(store.lastNotification).toEqual(payload)
    })
  })

  describe('fetchUnreadCount', () => {
    it('sets unreadCount from the adapter', async () => {
      mockGetUnreadCount.mockResolvedValueOnce(7)
      const store = useNotificationStore()
      await store.fetchUnreadCount()
      expect(store.unreadCount).toBe(7)
    })

    it('resolves silently on adapter error', async () => {
      mockGetUnreadCount.mockRejectedValueOnce(new Error('network error'))
      const store = useNotificationStore()
      await expect(store.fetchUnreadCount()).resolves.toBeUndefined()
    })
  })

  describe('markAsRead', () => {
    it('calls the adapter and decrements unreadCount', async () => {
      mockGetUnreadCount.mockResolvedValueOnce(3)
      isAuthenticated.value = true
      accessToken.value = 'test-token'
      const store = useNotificationStore()
      await flushPromises()

      mockMarkAsRead.mockResolvedValueOnce(undefined)
      await store.markAsRead('notif-1')

      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1')
      expect(store.unreadCount).toBe(2)
    })

    it('does not go below 0', async () => {
      const store = useNotificationStore()
      mockMarkAsRead.mockResolvedValueOnce(undefined)
      await store.markAsRead('notif-1')
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('getPreferences', () => {
    it('stores the preferences returned by the adapter', async () => {
      const prefs = [
        { id: 'p1', channel: 'EMAIL', enabled: true },
        { id: 'p2', channel: 'SMS', enabled: false },
      ]
      mockGetPreferences.mockResolvedValueOnce(prefs)
      mockWebPushSyncSubscription.mockResolvedValue(undefined)
      const store = useNotificationStore()
      await store.getPreferences()
      expect(store.preferences).toEqual(prefs)
    })

    it('calls the adapter once', async () => {
      mockGetPreferences.mockResolvedValueOnce([])
      const store = useNotificationStore()
      await store.getPreferences()
      expect(mockGetPreferences).toHaveBeenCalledTimes(1)
    })

    it('calls syncSubscription when WEB_PUSH is enabled', async () => {
      mockGetPreferences.mockResolvedValueOnce([{ id: 'p1', channel: 'WEB_PUSH', enabled: true }])
      mockWebPushSyncSubscription.mockResolvedValueOnce(undefined)
      const store = useNotificationStore()
      await store.getPreferences()
      expect(mockWebPushSyncSubscription).toHaveBeenCalledTimes(1)
    })

    it('does not call syncSubscription when WEB_PUSH is disabled', async () => {
      mockGetPreferences.mockResolvedValueOnce([{ id: 'p1', channel: 'WEB_PUSH', enabled: false }])
      const store = useNotificationStore()
      await store.getPreferences()
      expect(mockWebPushSyncSubscription).not.toHaveBeenCalled()
    })

    it('does not call syncSubscription when WEB_PUSH is absent', async () => {
      mockGetPreferences.mockResolvedValueOnce([{ id: 'p1', channel: 'EMAIL', enabled: true }])
      const store = useNotificationStore()
      await store.getPreferences()
      expect(mockWebPushSyncSubscription).not.toHaveBeenCalled()
    })

    it('ignores errors from syncSubscription', async () => {
      mockGetPreferences.mockResolvedValueOnce([{ id: 'p1', channel: 'WEB_PUSH', enabled: true }])
      mockWebPushSyncSubscription.mockRejectedValueOnce(new Error('some error'))
      const store = useNotificationStore()
      await expect(store.getPreferences()).resolves.toBeUndefined()
    })
  })

  describe('updatePreferences', () => {
    it('updates preferences with the adapter response', async () => {
      const updated = [
        { id: 'p1', channel: 'EMAIL', enabled: false },
        { id: 'p2', channel: 'SMS', enabled: true },
      ]
      mockUpdatePreferences.mockResolvedValueOnce(updated)
      const store = useNotificationStore()
      await store.updatePreferences({ preferences: [{ channel: 'EMAIL', enabled: false }, { channel: 'SMS', enabled: true }] })
      expect(store.preferences).toEqual(updated)
    })

    it('calls the adapter with the given payload', async () => {
      const payload = { preferences: [{ channel: 'EMAIL', enabled: false }] }
      mockUpdatePreferences.mockResolvedValueOnce([])
      const store = useNotificationStore()
      await store.updatePreferences(payload)
      expect(mockUpdatePreferences).toHaveBeenCalledWith(payload)
    })
  })

  describe('getAvailableChannels', () => {
    it('has availableChannels as empty array initially', () => {
      const store = useNotificationStore()
      expect(store.availableChannels).toEqual([])
    })

    it('stores the channels returned by the adapter', async () => {
      mockGetAvailableChannels.mockResolvedValueOnce(['EMAIL', 'SMS', 'PUSH'])
      const store = useNotificationStore()
      await store.getAvailableChannels()
      expect(store.availableChannels).toEqual(['EMAIL', 'SMS', 'PUSH'])
    })

    it('calls the adapter once', async () => {
      mockGetAvailableChannels.mockResolvedValueOnce([])
      const store = useNotificationStore()
      await store.getAvailableChannels()
      expect(mockGetAvailableChannels).toHaveBeenCalledTimes(1)
    })

    it('stores an empty array when no channels are returned', async () => {
      mockGetAvailableChannels.mockResolvedValueOnce([])
      const store = useNotificationStore()
      await store.getAvailableChannels()
      expect(store.availableChannels).toEqual([])
    })
  })

  describe('deleteNotification', () => {
    it('calls the adapter with the notification id', async () => {
      const store = useNotificationStore()
      mockDeleteNotification.mockResolvedValueOnce(undefined)
      await store.deleteNotification('notif-5', false)
      expect(mockDeleteNotification).toHaveBeenCalledWith('notif-5')
    })

    it('decrements unreadCount when the notification was unread', async () => {
      mockGetUnreadCount.mockResolvedValueOnce(4)
      isAuthenticated.value = true
      accessToken.value = 'test-token'
      const store = useNotificationStore()
      await flushPromises()

      mockDeleteNotification.mockResolvedValueOnce(undefined)
      await store.deleteNotification('notif-5', true)

      expect(store.unreadCount).toBe(3)
    })

    it('does not decrement unreadCount when the notification was already read', async () => {
      mockGetUnreadCount.mockResolvedValueOnce(4)
      isAuthenticated.value = true
      accessToken.value = 'test-token'
      const store = useNotificationStore()
      await flushPromises()

      mockDeleteNotification.mockResolvedValueOnce(undefined)
      await store.deleteNotification('notif-5', false)

      expect(store.unreadCount).toBe(4)
    })

    it('does not go below 0', async () => {
      const store = useNotificationStore()
      mockDeleteNotification.mockResolvedValueOnce(undefined)
      await store.deleteNotification('notif-5', true)
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('subscribePush', () => {
    it('delegates to the webPushAdapter', async () => {
      mockWebPushSubscribe.mockResolvedValueOnce(undefined)
      const store = useNotificationStore()
      await store.subscribePush()
      expect(mockWebPushSubscribe).toHaveBeenCalledTimes(1)
    })

    it('propagates errors from the webPushAdapter', async () => {
      mockWebPushSubscribe.mockRejectedValueOnce(new Error('web_push_permission_denied'))
      const store = useNotificationStore()
      await expect(store.subscribePush()).rejects.toThrow('web_push_permission_denied')
    })
  })

})
