import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGet, mockPatch, mockDelete, mockPut, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
  mockDelete: vi.fn(),
  mockPut: vi.fn(),
  mockPost: vi.fn(),
}))

vi.mock('@/api/client', () => ({
  apiClient: {
    get: mockGet,
    patch: mockPatch,
    delete: mockDelete,
    put: mockPut,
    post: mockPost,
  },
}))

import { NotificationHttpAdapter } from '@/infrastructure/adapters/http/notification.http-adapter'
import { NotificationStatus, NotificationType } from '@/core/domain/types/notification.types'

describe('NotificationHttpAdapter', () => {
  let adapter: NotificationHttpAdapter

  beforeEach(() => {
    adapter = new NotificationHttpAdapter()
    vi.clearAllMocks()
  })

  describe('getUnreadCount', () => {
    it('calls the correct endpoint with channel=WEBSOCKET and status=SENT', async () => {
      mockGet.mockResolvedValueOnce({ data: { count: 3 } })
      await adapter.getUnreadCount()
      expect(mockGet).toHaveBeenCalledWith('/notifications/unread-count', {
        params: { channel: NotificationType.WEBSOCKET, status: NotificationStatus.SENT },
      })
    })

    it('returns the count from the response', async () => {
      mockGet.mockResolvedValueOnce({ data: { count: 7 } })
      const result = await adapter.getUnreadCount()
      expect(result).toBe(7)
    })

    it('returns 0 when count is missing from the response', async () => {
      mockGet.mockResolvedValueOnce({ data: {} })
      const result = await adapter.getUnreadCount()
      expect(result).toBe(0)
    })
  })

  describe('getNotifications', () => {
    const mockMeta = {
      currentPage: 1,
      pageSize: 10,
      totalItems: 45,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: false,
    }

    it('calls the correct endpoint with channel=WEBSOCKET, page and pageSize', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [], meta: mockMeta } })
      await adapter.getNotifications(1, 10)
      expect(mockGet).toHaveBeenCalledWith('/notifications/', {
        params: { channel: NotificationType.WEBSOCKET, page: 1, pageSize: 10 },
      })
    })

    it('returns the full paginated response', async () => {
      const notifications = [
        { id: '1', subject: 'Hello', status: NotificationStatus.SENT, channel: NotificationType.WEBSOCKET },
        { id: '2', subject: 'World', status: NotificationStatus.READ, channel: NotificationType.WEBSOCKET },
      ]
      const response = { data: notifications, meta: mockMeta }
      mockGet.mockResolvedValueOnce({ data: response })
      const result = await adapter.getNotifications(1, 10)
      expect(result).toEqual(response)
    })
  })

  describe('markAsRead', () => {
    it('calls the correct endpoint with id and channel as query params', async () => {
      mockPatch.mockResolvedValueOnce({ data: undefined })
      await adapter.markAsRead('notif-42')
      expect(mockPatch).toHaveBeenCalledWith('/notifications/read', undefined, {
        params: { id: 'notif-42', channel: NotificationType.WEBSOCKET },
      })
    })
  })

  describe('deleteNotification', () => {
    it('calls DELETE on the correct endpoint', async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await adapter.deleteNotification('notif-99')
      expect(mockDelete).toHaveBeenCalledWith('/notifications/notif-99', { data: undefined })
    })
  })

  describe('getPreferences', () => {
    const mockPreferences = [
      { id: 'pref-1', channel: 'EMAIL', enabled: true },
      { id: 'pref-2', channel: 'SMS', enabled: false },
    ]

    it('calls GET on the correct endpoint', async () => {
      mockGet.mockResolvedValueOnce({ data: mockPreferences })
      await adapter.getPreferences()
      expect(mockGet).toHaveBeenCalledWith('/notifications/preferences', { params: undefined })
    })

    it('returns the preferences array', async () => {
      mockGet.mockResolvedValueOnce({ data: mockPreferences })
      const result = await adapter.getPreferences()
      expect(result).toEqual(mockPreferences)
    })
  })

  describe('getAvailableChannels', () => {
    it('calls GET on the correct endpoint', async () => {
      mockGet.mockResolvedValueOnce({ data: { channels: ['EMAIL', 'SMS'] } })
      await adapter.getAvailableChannels()
      expect(mockGet).toHaveBeenCalledWith('/notifications/channels', { params: undefined })
    })

    it('returns the channels array from the response', async () => {
      mockGet.mockResolvedValueOnce({ data: { channels: ['EMAIL', 'SMS'] } })
      const result = await adapter.getAvailableChannels()
      expect(result).toEqual(['EMAIL', 'SMS'])
    })

    it('returns an empty array when channels is empty', async () => {
      mockGet.mockResolvedValueOnce({ data: { channels: [] } })
      const result = await adapter.getAvailableChannels()
      expect(result).toEqual([])
    })
  })

  describe('updatePreferences', () => {
    const payload = {
      preferences: [
        { channel: 'EMAIL', enabled: false },
        { channel: 'SMS', enabled: true },
      ],
    }
    const mockUpdated = [
      { id: 'pref-1', channel: 'EMAIL', enabled: false },
      { id: 'pref-2', channel: 'SMS', enabled: true },
    ]

    it('calls PUT on the correct endpoint with the payload', async () => {
      mockPut.mockResolvedValueOnce({ data: mockUpdated })
      await adapter.updatePreferences(payload)
      expect(mockPut).toHaveBeenCalledWith('/notifications/preferences', payload)
    })

    it('returns the updated preferences array', async () => {
      mockPut.mockResolvedValueOnce({ data: mockUpdated })
      const result = await adapter.updatePreferences(payload)
      expect(result).toEqual(mockUpdated)
    })
  })

  describe('subscribePush', () => {
    const payload = {
      endpoint: 'https://push.example.com/sub/abc123',
      p256dh: 'key1',
      auth: 'auth1',
    }

    it('calls POST on the correct endpoint with the payload', async () => {
      mockPost.mockResolvedValueOnce({ data: undefined })
      await adapter.subscribePush(payload)
      expect(mockPost).toHaveBeenCalledWith('/notifications/push-subscriptions', payload)
    })
  })

  describe('unsubscribePush', () => {
    it('calls DELETE on the correct endpoint with the endpoint in the body', async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined })
      await adapter.unsubscribePush('https://push.example.com/sub/abc123')
      expect(mockDelete).toHaveBeenCalledWith('/notifications/push-subscriptions', {
        data: { endpoint: 'https://push.example.com/sub/abc123' },
      })
    })
  })
})
