import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockIo, mockSocket } = vi.hoisted(() => {
  const mockSocket = { on: vi.fn().mockReturnThis(), disconnect: vi.fn() }
  const mockIo = vi.fn(() => mockSocket)
  return { mockIo, mockSocket }
})

vi.mock('socket.io-client', () => ({ io: mockIo }))

import {
  NotificationWsAdapter,
  type NotificationWsPayload,
} from '@/infrastructure/adapters/websocket/notification.ws-adapter'

describe('NotificationWsAdapter', () => {
  let adapter: NotificationWsAdapter

  beforeEach(() => {
    adapter = new NotificationWsAdapter()
    vi.clearAllMocks()
    mockSocket.on.mockReturnThis()
  })

  describe('connect', () => {
    it('connects to the /notifications namespace', () => {
      adapter.connect('my-token', vi.fn())
      const url = mockIo.mock.calls[0]![0] as string
      expect(url).toMatch(/\/notifications$/)
    })

    it('passes the token without a Bearer prefix', () => {
      adapter.connect('my-token', vi.fn())
      const options = mockIo.mock.calls[0]![1] as { auth: { token: string } }
      expect(options.auth.token).toBe('my-token')
      expect(options.auth.token).not.toMatch(/^Bearer /)
    })

    it('uses websocket transport only', () => {
      adapter.connect('my-token', vi.fn())
      const options = mockIo.mock.calls[0]![1] as { transports: string[] }
      expect(options.transports).toEqual(['websocket'])
    })

    it('listens for the "notification:new" event', () => {
      const callback = vi.fn()
      adapter.connect('my-token', callback)
      expect(mockSocket.on).toHaveBeenCalledWith('notification:new', callback)
    })

    it('calls the callback with the payload when "notification:new" fires', () => {
      const callback = vi.fn()
      adapter.connect('my-token', callback)

      const [, handler] = mockSocket.on.mock.calls[0]! as [
        string,
        (payload: NotificationWsPayload) => void,
      ]
      const payload: NotificationWsPayload = { subject: 'Hello', body: 'World' }
      handler(payload)

      expect(callback).toHaveBeenCalledWith(payload)
    })
  })

  describe('disconnect', () => {
    it('calls socket.disconnect', () => {
      adapter.connect('my-token', vi.fn())
      adapter.disconnect()
      expect(mockSocket.disconnect).toHaveBeenCalled()
    })

    it('does not throw if called before connect', () => {
      expect(() => adapter.disconnect()).not.toThrow()
    })
  })
})
