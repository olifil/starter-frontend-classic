import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSubscribePush = vi.fn()
const mockUnsubscribePush = vi.fn()

vi.mock('@/infrastructure/adapters/http/notification.http-adapter', () => ({
  NotificationHttpAdapter: vi.fn(function () {
    return { subscribePush: mockSubscribePush, unsubscribePush: mockUnsubscribePush }
  }),
}))

import { WebPushAdapter } from '@/infrastructure/adapters/webpush/webpush.adapter'
import { NotificationHttpAdapter } from '@/infrastructure/adapters/http/notification.http-adapter'

function makeAdapter() {
  return new WebPushAdapter(new NotificationHttpAdapter() as InstanceType<typeof NotificationHttpAdapter>)
}

function mockServiceWorker(overrides: {
  registration?: object | null
  permission?: NotificationPermission
  subscription?: object | null
} = {}) {
  const mockSubscription = overrides.subscription !== undefined
    ? overrides.subscription
    : { endpoint: 'https://push.example.com/sub/abc', toJSON: () => ({ keys: { p256dh: 'p256', auth: 'auth' } }), unsubscribe: vi.fn().mockResolvedValue(true) }

  const mockRegistration = overrides.registration !== undefined
    ? overrides.registration
    : {
        pushManager: {
          getSubscription: vi.fn().mockResolvedValue(null),
          subscribe: vi.fn().mockResolvedValue(mockSubscription),
        },
      }

  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      register: vi.fn().mockResolvedValue(mockRegistration),
      ready: Promise.resolve(mockRegistration),
      getRegistration: vi.fn().mockResolvedValue(mockRegistration),
    },
    configurable: true,
    writable: true,
  })

  Object.defineProperty(window, 'PushManager', { value: class {}, configurable: true })

  ;(window.Notification as { requestPermission: ReturnType<typeof vi.fn> }).requestPermission =
    vi.fn().mockResolvedValue(overrides.permission ?? 'granted')

  return { mockRegistration, mockSubscription }
}

describe('WebPushAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // jsdom does not define Notification — provide a minimal mock
    if (!('Notification' in window)) {
      Object.defineProperty(window, 'Notification', {
        value: { requestPermission: vi.fn() },
        configurable: true,
        writable: true,
      })
    }
  })

  describe('subscribe', () => {
    it('throws web_push_not_supported when serviceWorker is not available', async () => {
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true })
      const adapter = makeAdapter()
      await expect(adapter.subscribe()).rejects.toThrow('web_push_not_supported')
    })

    it('throws web_push_permission_denied when permission is denied', async () => {
      mockServiceWorker({ permission: 'denied' })
      const adapter = makeAdapter()
      await expect(adapter.subscribe()).rejects.toThrow('web_push_permission_denied')
    })

    it('calls httpAdapter.subscribePush with the subscription payload', async () => {
      const { mockRegistration } = mockServiceWorker()
      mockSubscribePush.mockResolvedValueOnce(undefined)
      const adapter = makeAdapter()
      await adapter.subscribe()
      expect(mockRegistration.pushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array),
      })
      expect(mockSubscribePush).toHaveBeenCalledWith({
        endpoint: 'https://push.example.com/sub/abc',
        p256dh: 'p256',
        auth: 'auth',
      })
    })

    it('reuses existing browser subscription and still posts to the API', async () => {
      const existingSub = { endpoint: 'existing', toJSON: () => ({ keys: { p256dh: 'p256', auth: 'auth' } }) }
      const reg = {
        pushManager: {
          getSubscription: vi.fn().mockResolvedValue(existingSub),
          subscribe: vi.fn(),
        },
      }
      mockServiceWorker({ registration: reg })
      mockSubscribePush.mockResolvedValueOnce(undefined)
      const adapter = makeAdapter()
      await adapter.subscribe()
      expect(reg.pushManager.subscribe).not.toHaveBeenCalled()
      expect(mockSubscribePush).toHaveBeenCalledWith({
        endpoint: 'existing',
        p256dh: 'p256',
        auth: 'auth',
      })
    })
  })

  describe('unsubscribe', () => {
    it('does nothing when serviceWorker is not available', async () => {
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true })
      const adapter = makeAdapter()
      await expect(adapter.unsubscribe()).resolves.toBeUndefined()
    })

    it('does nothing when no registration is found', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { getRegistration: vi.fn().mockResolvedValue(undefined) },
        configurable: true,
        writable: true,
      })
      const adapter = makeAdapter()
      await expect(adapter.unsubscribe()).resolves.toBeUndefined()
      expect(mockUnsubscribePush).not.toHaveBeenCalled()
    })

    it('calls httpAdapter.unsubscribePush and unsubscribes from the browser', async () => {
      const mockUnsubscribe = vi.fn().mockResolvedValue(true)
      const sub = { endpoint: 'https://push.example.com/sub/abc', unsubscribe: mockUnsubscribe }
      const reg = { pushManager: { getSubscription: vi.fn().mockResolvedValue(sub) } }
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { getRegistration: vi.fn().mockResolvedValue(reg) },
        configurable: true,
        writable: true,
      })
      mockUnsubscribePush.mockResolvedValueOnce(undefined)
      const adapter = makeAdapter()
      await adapter.unsubscribe()
      expect(mockUnsubscribePush).toHaveBeenCalledWith('https://push.example.com/sub/abc')
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('syncSubscription', () => {
    it('does nothing when serviceWorker is not available', async () => {
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true })
      const adapter = makeAdapter()
      await expect(adapter.syncSubscription()).resolves.toBeUndefined()
      expect(mockSubscribePush).not.toHaveBeenCalled()
    })

    it('does nothing when permission is not granted (default)', async () => {
      mockServiceWorker({ permission: 'default' })
      Object.defineProperty(window.Notification, 'permission', { value: 'default', configurable: true })
      const adapter = makeAdapter()
      await expect(adapter.syncSubscription()).resolves.toBeUndefined()
      expect(mockSubscribePush).not.toHaveBeenCalled()
    })

    it('does nothing when permission is denied', async () => {
      mockServiceWorker({ permission: 'denied' })
      Object.defineProperty(window.Notification, 'permission', { value: 'denied', configurable: true })
      const adapter = makeAdapter()
      await expect(adapter.syncSubscription()).resolves.toBeUndefined()
      expect(mockSubscribePush).not.toHaveBeenCalled()
    })

    it('does nothing when already subscribed', async () => {
      const existingSub = { endpoint: 'existing', toJSON: () => ({ keys: { p256dh: 'p', auth: 'a' } }) }
      const reg = { pushManager: { getSubscription: vi.fn().mockResolvedValue(existingSub), subscribe: vi.fn() } }
      mockServiceWorker({ registration: reg })
      Object.defineProperty(window.Notification, 'permission', { value: 'granted', configurable: true })
      const adapter = makeAdapter()
      await adapter.syncSubscription()
      expect(mockSubscribePush).not.toHaveBeenCalled()
    })

    it('subscribes when permission is granted and not yet subscribed', async () => {
      const { mockRegistration } = mockServiceWorker()
      Object.defineProperty(window.Notification, 'permission', { value: 'granted', configurable: true })
      mockSubscribePush.mockResolvedValueOnce(undefined)
      const adapter = makeAdapter()
      await adapter.syncSubscription()
      expect(mockSubscribePush).toHaveBeenCalledWith({
        endpoint: 'https://push.example.com/sub/abc',
        p256dh: 'p256',
        auth: 'auth',
      })
      expect(mockRegistration.pushManager.subscribe).toHaveBeenCalled()
    })
  })

  describe('isSubscribed', () => {
    it('returns false when serviceWorker is not available', async () => {
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true })
      const adapter = makeAdapter()
      expect(await adapter.isSubscribed()).toBe(false)
    })

    it('returns false when no subscription exists', async () => {
      const reg = { pushManager: { getSubscription: vi.fn().mockResolvedValue(null) } }
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { getRegistration: vi.fn().mockResolvedValue(reg) },
        configurable: true,
        writable: true,
      })
      Object.defineProperty(window, 'PushManager', { value: class {}, configurable: true })
      const adapter = makeAdapter()
      expect(await adapter.isSubscribed()).toBe(false)
    })

    it('returns true when a subscription exists', async () => {
      const reg = { pushManager: { getSubscription: vi.fn().mockResolvedValue({ endpoint: 'x' }) } }
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { getRegistration: vi.fn().mockResolvedValue(reg) },
        configurable: true,
        writable: true,
      })
      Object.defineProperty(window, 'PushManager', { value: class {}, configurable: true })
      const adapter = makeAdapter()
      expect(await adapter.isSubscribed()).toBe(true)
    })
  })
})
