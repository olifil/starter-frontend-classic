import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'

vi.mock('vue-sonner', () => ({ toast: { error: vi.fn() } }))
vi.mock('@/i18n', () => ({ default: { global: { t: (k: string) => k } } }))

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' },
  })
})

type MockRequestConfig = { headers: Record<string, string> }

const { captured, axiosPost, apiClientMock } = vi.hoisted(() => {
  const captured = {
    requestHandler: null as ((config: MockRequestConfig) => MockRequestConfig) | null,
    responseErrorHandler: null as ((error: unknown) => Promise<unknown>) | null,
  }

  const axiosPost = vi.fn()
  const apiClientRetry = vi.fn()

  const apiClientMock = Object.assign(apiClientRetry, {
    interceptors: {
      request: {
        use: vi.fn((fn: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig) => {
          captured.requestHandler = fn as unknown as (config: MockRequestConfig) => MockRequestConfig
        }),
      },
      response: {
        use: vi.fn((_: unknown, errorFn: (error: unknown) => Promise<unknown>) => {
          captured.responseErrorHandler = errorFn
        }),
      },
    },
    defaults: { headers: { common: {} } },
  })

  return { captured, axiosPost, apiClientMock }
})

vi.mock('axios', () => ({
  default: {
    create: () => apiClientMock,
    isAxiosError: (e: unknown) => (e as { isAxiosError?: boolean })?.isAxiosError === true,
    post: axiosPost,
  },
}))

// Trigger module load so interceptors are registered
await import('@/api/client')

function makeAxiosError(status: number) {
  return {
    isAxiosError: true,
    response: { status, data: { message: 'error' } },
    config: { headers: {} },
  }
}

describe('apiClient — request interceptor', () => {
  beforeEach(() => localStorage.clear())

  it('adds Authorization header when access_token exists', () => {
    localStorage.setItem('access_token', 'my-token')
    const config = { headers: {} as Record<string, string> }
    captured.requestHandler!(config)
    expect(config.headers.Authorization).toBe('Bearer my-token')
  })

  it('does not add Authorization header when no token', () => {
    const config = { headers: {} as Record<string, string> }
    captured.requestHandler!(config)
    expect(config.headers.Authorization).toBeUndefined()
  })
})

describe('apiClient — response error interceptor', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('redirects to /login when 401 and no refresh_token', async () => {
    const error = makeAxiosError(401)
    await expect(captured.responseErrorHandler!(error)).rejects.toBeDefined()
    expect(window.location.href).toBe('/connexion')
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('refreshes token and retries request on 401', async () => {
    localStorage.setItem('refresh_token', 'old-refresh')
    axiosPost.mockResolvedValueOnce({
      data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    })
    apiClientMock.mockResolvedValueOnce({ data: 'retried' })

    const error = makeAxiosError(401)
    const result = await captured.responseErrorHandler!(error)

    expect(axiosPost).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      { refreshToken: 'old-refresh' },
    )
    expect(localStorage.getItem('access_token')).toBe('new-access')
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh')
    expect(result).toEqual({ data: 'retried' })
  })

  it('clears tokens and redirects to /login when refresh fails', async () => {
    localStorage.setItem('access_token', 'old-access')
    localStorage.setItem('refresh_token', 'old-refresh')
    axiosPost.mockRejectedValueOnce(new Error('refresh failed'))

    const error = makeAxiosError(401)
    await expect(captured.responseErrorHandler!(error)).rejects.toBeDefined()

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(window.location.href).toBe('/connexion')
  })

  it('does not retry a request already marked with _retry', async () => {
    localStorage.setItem('refresh_token', 'some-refresh')
    const error = {
      ...makeAxiosError(401),
      config: { headers: {}, _retry: true },
    }

    await expect(captured.responseErrorHandler!(error)).rejects.toBeDefined()
    expect(axiosPost).not.toHaveBeenCalled()
  })

  it('shows a toast for non-401 errors', async () => {
    const { toast } = await import('vue-sonner')
    const error = makeAxiosError(500)

    await expect(captured.responseErrorHandler!(error)).rejects.toBeDefined()
    expect(toast.error).toHaveBeenCalled()
  })

  it('does not show a toast for 401 errors', async () => {
    const { toast } = await import('vue-sonner')
    const error = makeAxiosError(401)

    await expect(captured.responseErrorHandler!(error)).rejects.toBeDefined()
    expect(toast.error).not.toHaveBeenCalled()
  })
})
