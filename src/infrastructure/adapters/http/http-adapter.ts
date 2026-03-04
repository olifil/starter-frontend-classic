import { apiClient } from '@/api/client'

export class HttpAdapter {
  constructor(private readonly resource: string) {}

  async post<T>(path: string, data?: unknown): Promise<T> {
    const response = await apiClient.post<T>(this.buildRoute(path), data)
    return response.data
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const response = await apiClient.get<T>(this.buildRoute(path), { params })
    return response.data
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    const response = await apiClient.put<T>(this.buildRoute(path), data)
    return response.data
  }

  async patch<T>(path: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
    const response = await apiClient.patch<T>(this.buildRoute(path), data, { params })
    return response.data
  }

  async delete<T>(path: string, data?: unknown): Promise<T> {
    const response = await apiClient.delete<T>(this.buildRoute(path), { data })
    return response.data
  }

  private buildRoute(path: string): string {
    return `/${this.resource}${path}`
  }
}
