import type { NotificationHttpAdapter } from '../http/notification.http-adapter'

export class WebPushAdapter {
  private readonly publicKey: string

  constructor(private readonly httpAdapter: NotificationHttpAdapter) {
    this.publicKey = import.meta.env.VITE_WEBPUSH_PUBLIC_KEY ?? ''
  }

  async subscribe(): Promise<void> {
    if (!this.isSupported()) throw new Error('web_push_not_supported')

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') throw new Error('web_push_permission_denied')

    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const existing = await registration.pushManager.getSubscription()
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicKey),
      }))

    const json = subscription.toJSON()
    await this.httpAdapter.subscribePush({
      endpoint: subscription.endpoint,
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
    })
  }

  async unsubscribe(): Promise<void> {
    if (!navigator.serviceWorker) return

    const registration = await navigator.serviceWorker.getRegistration('/sw.js')
    if (!registration) return

    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return

    await this.httpAdapter.unsubscribePush(subscription.endpoint)
    await subscription.unsubscribe()
  }

  async syncSubscription(): Promise<void> {
    if (!this.isSupported()) return
    if (Notification.permission !== 'granted') return
    const alreadySubscribed = await this.isSubscribed()
    if (alreadySubscribed) return
    await this.subscribe()
  }

  async isSubscribed(): Promise<boolean> {
    if (!this.isSupported()) return false
    const registration = await navigator.serviceWorker.getRegistration('/sw.js')
    if (!registration) return false
    const subscription = await registration.pushManager.getSubscription()
    return !!subscription
  }

  private isSupported(): boolean {
    return !!navigator.serviceWorker && 'PushManager' in window
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
  }
}
