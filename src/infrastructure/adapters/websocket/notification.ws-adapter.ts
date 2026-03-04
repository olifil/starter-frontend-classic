import { io, type Socket } from 'socket.io-client'

const WS_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:3000/api/v1'
).replace('/api/v1', '')

export type NotificationWsPayload = {
  subject?: string
  body: string
  metadata?: Record<string, unknown>
}

export class NotificationWsAdapter {
  private socket: Socket | null = null

  connect(token: string, onNotification: (payload: NotificationWsPayload) => void): void {
    this.socket = io(`${WS_BASE_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    })

    this.socket.on('notification:new', onNotification)
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }
}
