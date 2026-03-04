import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/interface/stores/user.store'
import type { UserProfile } from '@/core/domain/types/user.types'

const { mockGetMe, mockUpdateMe, mockDeleteMe, mockClearTokens, mockPush } = vi.hoisted(() => ({
  mockGetMe: vi.fn(),
  mockUpdateMe: vi.fn(),
  mockDeleteMe: vi.fn(),
  mockClearTokens: vi.fn(),
  mockPush: vi.fn(),
}))

vi.mock('@/infrastructure/adapters/http/user.http-adapter', () => ({
  UserHttpAdapter: vi.fn(function () {
    return { getMe: mockGetMe, updateMe: mockUpdateMe, deleteMe: mockDeleteMe }
  }),
}))

vi.mock('@/interface/stores/auth.store', () => ({
  useAuthStore: () => ({ clearTokens: mockClearTokens }),
}))

vi.mock('vue-router', async () => ({
  ...(await vi.importActual('vue-router')),
  useRouter: () => ({ push: mockPush }),
}))

const mockUser: UserProfile = {
  id: '1',
  email: 'jean.dupont@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  fullName: 'Jean Dupont',
  phoneNumber: null,
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
}

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('me is null', () => {
      const store = useUserStore()
      expect(store.me).toBeNull()
    })
  })

  describe('getMe', () => {
    it('sets me on success', async () => {
      mockGetMe.mockResolvedValueOnce(mockUser)
      const store = useUserStore()
      await store.getMe()
      expect(store.me).toEqual(mockUser)
    })

    it('sets me to null on failure', async () => {
      mockGetMe.mockRejectedValueOnce(new Error('unauthorized'))
      const store = useUserStore()
      store.me = mockUser
      await store.getMe()
      expect(store.me).toBeNull()
    })
  })

  describe('updateMe', () => {
    it('updates me with the response', async () => {
      const updated = { ...mockUser, firstName: 'Marie' }
      mockUpdateMe.mockResolvedValueOnce(updated)
      const store = useUserStore()
      await store.updateMe({ firstName: 'Marie' })
      expect(mockUpdateMe).toHaveBeenCalledWith({ firstName: 'Marie' })
      expect(store.me).toEqual(updated)
    })

    it('calls repository with newEmail and currentPassword', async () => {
      const updated = { ...mockUser, email: 'nouveau@example.com' }
      mockUpdateMe.mockResolvedValueOnce(updated)
      const store = useUserStore()
      await store.updateMe({ newEmail: 'nouveau@example.com', currentPassword: 'Password1!' })
      expect(mockUpdateMe).toHaveBeenCalledWith({
        newEmail: 'nouveau@example.com',
        currentPassword: 'Password1!',
      })
      expect(store.me).toEqual(updated)
    })

    it('calls repository with phoneNumber and updates me', async () => {
      const updated = { ...mockUser, phoneNumber: '+33612345678' }
      mockUpdateMe.mockResolvedValueOnce(updated)
      const store = useUserStore()
      await store.updateMe({ phoneNumber: '+33612345678' })
      expect(mockUpdateMe).toHaveBeenCalledWith({ phoneNumber: '+33612345678' })
      expect(store.me).toEqual(updated)
    })

    it('calls repository with phoneNumber null to remove the number', async () => {
      const updated = { ...mockUser, phoneNumber: null }
      mockUpdateMe.mockResolvedValueOnce(updated)
      const store = useUserStore()
      await store.updateMe({ phoneNumber: null })
      expect(mockUpdateMe).toHaveBeenCalledWith({ phoneNumber: null })
      expect(store.me).toEqual(updated)
    })
  })

  describe('deleteMe', () => {
    it('calls repository deleteMe, clears tokens, nullifies me and redirects to homepage', async () => {
      mockDeleteMe.mockResolvedValueOnce(undefined)
      const store = useUserStore()
      store.me = mockUser
      await store.deleteMe()
      expect(mockDeleteMe).toHaveBeenCalled()
      expect(mockClearTokens).toHaveBeenCalled()
      expect(store.me).toBeNull()
      expect(mockPush).toHaveBeenCalledWith({ name: 'homepage' })
    })
  })
})
