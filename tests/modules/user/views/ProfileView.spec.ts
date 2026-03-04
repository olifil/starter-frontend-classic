import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount, flushPromises, DOMWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import ProfileView from '@/interface/views/ProfileView.vue'
import type { UserProfile } from '@/core/domain/types/user.types'

const { mockGetMe, mockUpdateMe, mockDeleteMe, mockGetPreferences, mockUpdatePreferences, mockGetAvailableChannels, mockWebPushSubscribe, mockWebPushSyncSubscription } = vi.hoisted(() => ({
  mockGetMe: vi.fn(),
  mockUpdateMe: vi.fn(),
  mockDeleteMe: vi.fn(),
  mockGetPreferences: vi.fn(),
  mockUpdatePreferences: vi.fn(),
  mockGetAvailableChannels: vi.fn(),
  mockWebPushSubscribe: vi.fn(),
  mockWebPushSyncSubscription: vi.fn(),
}))

vi.mock('@/infrastructure/adapters/http/user.http-adapter', () => ({
  UserHttpAdapter: vi.fn(function () {
    return { getMe: mockGetMe, updateMe: mockUpdateMe, deleteMe: mockDeleteMe }
  }),
}))

vi.mock('@/infrastructure/adapters/http/notification.http-adapter', () => ({
  NotificationHttpAdapter: vi.fn(function () {
    return { getUnreadCount: vi.fn(), getNotifications: vi.fn(), markAsRead: vi.fn(), deleteNotification: vi.fn(), getPreferences: mockGetPreferences, updatePreferences: mockUpdatePreferences, getAvailableChannels: mockGetAvailableChannels, subscribePush: vi.fn(), unsubscribePush: vi.fn() }
  }),
}))

vi.mock('@/infrastructure/adapters/websocket/notification.ws-adapter', () => ({
  NotificationWsAdapter: vi.fn(function () {
    return { connect: vi.fn(), disconnect: vi.fn() }
  }),
}))

vi.mock('@/infrastructure/adapters/webpush/webpush.adapter', () => ({
  WebPushAdapter: vi.fn(function () {
    return { subscribe: mockWebPushSubscribe, syncSubscription: mockWebPushSyncSubscription, isSubscribed: vi.fn().mockResolvedValue(false) }
  }),
}))

vi.mock('@/interface/stores/auth.store', () => ({
  useAuthStore: () => ({ isAuthenticated: ref(false), accessToken: ref(null), clearTokens: vi.fn() }),
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

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'homepage', component: { template: '<div />' } },
      { path: '/profil', name: 'profil', component: { template: '<div />' } },
    ],
  })
}

let wrapper: ReturnType<typeof mount> | null = null

function mountView() {
  wrapper = mount(ProfileView, {
    attachTo: document.body,
    global: { plugins: [createTestRouter(), createPinia(), i18n] },
  })
  return wrapper
}

const mockPreferences = [
  { id: 'pref-1', channel: 'EMAIL', enabled: true },
  { id: 'pref-2', channel: 'SMS', enabled: false },
  { id: 'pref-3', channel: 'PUSH', enabled: true },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockGetMe.mockResolvedValue(mockUser)
  mockGetPreferences.mockResolvedValue(mockPreferences)
  mockUpdatePreferences.mockResolvedValue(mockPreferences)
  mockGetAvailableChannels.mockResolvedValue(['EMAIL', 'PUSH'])
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
})

describe('ProfileView', () => {
  describe('user info section', () => {
    it('renders section title', async () => {
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('Informations personnelles')
    })

    it('displays user firstName and lastName after mount', async () => {
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('Jean')
      expect(w.text()).toContain('Dupont')
    })

    it('displays user email', async () => {
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('jean.dupont@example.com')
    })

    it('renders the edit button', async () => {
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('Modifier mes informations')
    })

    it('displays a dash when phoneNumber is null', async () => {
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('—')
    })

    it('displays the phone number when set', async () => {
      mockGetMe.mockResolvedValueOnce({ ...mockUser, phoneNumber: '+33612345678' })
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('+33612345678')
    })
  })

  describe('edit info dialog', () => {
    async function openEditDialog() {
      const w = mountView()
      await flushPromises()
      const btn = w.findAll('button').find((b) => b.text() === 'Modifier mes informations')
      await btn!.trigger('click')
      await flushPromises()
      return w
    }

    function getPhoneInput() {
      return new DOMWrapper(document.querySelector('input[type="tel"]') as HTMLElement)
    }

    it('pre-fills phone number from me when dialog opens', async () => {
      mockGetMe.mockResolvedValueOnce({ ...mockUser, phoneNumber: '+33612345678' })
      await openEditDialog()
      expect((document.querySelector('input[type="tel"]') as HTMLInputElement)?.value).toBe('+33612345678')
    })

    it('shows invalid format error for malformed phone number', async () => {
      await openEditDialog()
      await getPhoneInput().setValue('0612345678')
      await nextTick()
      expect(document.body.textContent).toContain('format E.164')
    })

    it('does not show error for empty phone number', async () => {
      await openEditDialog()
      await nextTick()
      expect(document.body.textContent).not.toContain('format E.164')
    })

    it('calls updateMe with phoneNumber null when field is cleared', async () => {
      mockGetMe.mockResolvedValueOnce({ ...mockUser, phoneNumber: '+33612345678' })
      mockUpdateMe.mockResolvedValueOnce({ ...mockUser, phoneNumber: null })
      await openEditDialog()
      await getPhoneInput().setValue('')
      const saveBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Enregistrer' && !b.hasAttribute('disabled'),
      )
      await saveBtn!.click()
      await flushPromises()
      expect(mockUpdateMe).toHaveBeenCalledWith(
        expect.objectContaining({ phoneNumber: null }),
      )
    })

    it('calls updateMe with phoneNumber when a valid number is entered', async () => {
      mockUpdateMe.mockResolvedValueOnce({ ...mockUser, phoneNumber: '+33612345678' })
      await openEditDialog()
      await getPhoneInput().setValue('+33612345678')
      await nextTick()
      const saveBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Enregistrer' && !b.hasAttribute('disabled'),
      )
      await saveBtn!.click()
      await flushPromises()
      expect(mockUpdateMe).toHaveBeenCalledWith(
        expect.objectContaining({ phoneNumber: '+33612345678' }),
      )
    })
  })

  describe('email section', () => {
    it('renders section title', async () => {
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('Modifier mon adresse e-mail')
    })
  })

  describe('email dialog', () => {
    async function openEmailDialog() {
      const w = mountView()
      await flushPromises()
      const btn = w
        .findAll('button')
        .find((b) => b.text() === 'Modifier mon adresse e-mail')
      await btn!.trigger('click')
      await flushPromises()
      return w
    }

    function getEmailInput() {
      return new DOMWrapper(document.querySelector('input[type="email"]') as HTMLElement)
    }

    function getPasswordInput() {
      return new DOMWrapper(
        Array.from(document.querySelectorAll('input[type="password"]'))[0] as HTMLElement,
      )
    }

    it('save button is disabled when form is empty', async () => {
      await openEmailDialog()
      const saveBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Enregistrer' && b.hasAttribute('disabled'),
      )
      expect(saveBtn).toBeTruthy()
    })

    it('shows email required error on blur when empty', async () => {
      await openEmailDialog()
      await getEmailInput().trigger('blur')
      expect(document.body.textContent).toContain("L'adresse e-mail est requise")
    })

    it('shows invalid email error for malformed email', async () => {
      await openEmailDialog()
      await getEmailInput().setValue('not-an-email')
      await getEmailInput().trigger('blur')
      expect(document.body.textContent).toContain("L'adresse e-mail n'est pas valide")
    })

    it('shows password required error on blur when empty', async () => {
      await openEmailDialog()
      await getPasswordInput().trigger('blur')
      expect(document.body.textContent).toContain('Le mot de passe est requis')
    })

    it('calls updateMe with newEmail and currentPassword on submit', async () => {
      const updated = { ...mockUser, email: 'nouveau@example.com' }
      mockUpdateMe.mockResolvedValueOnce(updated)
      await openEmailDialog()
      await getEmailInput().setValue('nouveau@example.com')
      await getPasswordInput().setValue('Password1!')
      const saveBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Enregistrer' && !b.hasAttribute('disabled'),
      )
      await saveBtn!.click()
      await flushPromises()
      expect(mockUpdateMe).toHaveBeenCalledWith({
        newEmail: 'nouveau@example.com',
        currentPassword: 'Password1!',
      })
    })

    it('shows success message after submission', async () => {
      mockUpdateMe.mockResolvedValueOnce(mockUser)
      await openEmailDialog()
      await getEmailInput().setValue('nouveau@example.com')
      await getPasswordInput().setValue('Password1!')
      const saveBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Enregistrer' && !b.hasAttribute('disabled'),
      )
      await saveBtn!.click()
      await flushPromises()
      expect(document.body.textContent).toContain('E-mail de confirmation envoyé')
      expect(document.body.textContent).toContain('nouveau@example.com')
    })
  })

  describe('password section', () => {
    it('renders section title', async () => {
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('Modifier le mot de passe')
    })
  })

  describe('notification preferences section', () => {
    it('renders the section title', async () => {
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('Préférences de notifications')
    })

    it('renders one row per preference returned by the API', async () => {
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('E-mail')
      expect(w.text()).toContain('SMS')
      expect(w.text()).toContain('Notifications push')
    })

    it('save button is disabled before any change', async () => {
      const w = mountView()
      await flushPromises()
      const saveBtn = w.findAll('button').find((b) => b.text() === 'Enregistrer les préférences')
      expect(saveBtn?.attributes('disabled')).toBeDefined()
    })

    it('fetches available channels on mount', async () => {
      mountView()
      await flushPromises()
      expect(mockGetAvailableChannels).toHaveBeenCalledTimes(1)
    })

    it('switch for an available channel is enabled', async () => {
      mountView()
      await flushPromises()
      const switches = Array.from(document.querySelectorAll('[role="switch"]'))
      // EMAIL is the first preference and is in availableChannels
      expect(switches[0]?.hasAttribute('disabled')).toBe(false)
      expect(switches[0]?.hasAttribute('data-disabled')).toBe(false)
    })

    it('switch for an unavailable channel is disabled', async () => {
      mountView()
      await flushPromises()
      const switches = Array.from(document.querySelectorAll('[role="switch"]'))
      // SMS is the second preference and is NOT in availableChannels (['EMAIL', 'PUSH'])
      const smsSwitch = switches[1]
      expect(
        smsSwitch?.hasAttribute('disabled') || smsSwitch?.hasAttribute('data-disabled'),
      ).toBe(true)
    })

    it('row for an unavailable channel has reduced opacity', async () => {
      const w = mountView()
      await flushPromises()
      const items = w.findAll('li')
      // SMS row (index 1) should have opacity-50
      expect(items[1]?.classes()).toContain('opacity-50')
    })

    it('row for an available channel does not have reduced opacity', async () => {
      const w = mountView()
      await flushPromises()
      const items = w.findAll('li')
      // EMAIL row (index 0) should not have opacity-50
      expect(items[0]?.classes()).not.toContain('opacity-50')
    })

    it('enables the save button after a switch is toggled', async () => {
      mountView()
      await flushPromises()
      const switchEl = document.querySelector('[role="switch"]')
      await new DOMWrapper(switchEl as HTMLElement).trigger('click')
      await nextTick()
      const saveBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Enregistrer les préférences' && !b.hasAttribute('disabled'),
      )
      expect(saveBtn).toBeTruthy()
    })

    it('calls updatePreferences when save is clicked after a change', async () => {
      mountView()
      await flushPromises()
      const switchEl = document.querySelector('[role="switch"]')
      await new DOMWrapper(switchEl as HTMLElement).trigger('click')
      await nextTick()
      const saveBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Enregistrer les préférences' && !b.hasAttribute('disabled'),
      )
      await saveBtn!.click()
      await flushPromises()
      expect(mockUpdatePreferences).toHaveBeenCalledTimes(1)
    })
  })

  describe('WEB_PUSH toggle behavior', () => {
    beforeEach(() => {
      mockWebPushSyncSubscription.mockResolvedValue(undefined)
    })

    describe('toggle OFF (preference starts enabled)', () => {
      beforeEach(() => {
        mockGetPreferences.mockResolvedValue([{ id: 'pref-wp', channel: 'WEB_PUSH', enabled: true }])
        mockGetAvailableChannels.mockResolvedValue(['WEB_PUSH'])
      })

      it('does not call unsubscribe when WEB_PUSH is toggled off', async () => {
        mountView()
        await flushPromises()
        const switchEl = document.querySelector('[role="switch"]')
        await new DOMWrapper(switchEl as HTMLElement).trigger('click')
        await flushPromises()
        expect(mockWebPushSubscribe).not.toHaveBeenCalled()
      })

      it('enables the save button after toggling WEB_PUSH off', async () => {
        mountView()
        await flushPromises()
        const switchEl = document.querySelector('[role="switch"]')
        await new DOMWrapper(switchEl as HTMLElement).trigger('click')
        await flushPromises()
        const saveBtn = Array.from(document.querySelectorAll('button')).find(
          (b) => b.textContent?.trim() === 'Enregistrer les préférences' && !b.hasAttribute('disabled'),
        )
        expect(saveBtn).toBeTruthy()
      })
    })

    describe('toggle ON (preference starts disabled)', () => {
      beforeEach(() => {
        mockGetPreferences.mockResolvedValue([{ id: 'pref-wp', channel: 'WEB_PUSH', enabled: false }])
        mockGetAvailableChannels.mockResolvedValue(['WEB_PUSH'])
        mockWebPushSubscribe.mockResolvedValue(undefined)
      })

      it('calls subscribePush when WEB_PUSH is toggled on', async () => {
        mountView()
        await flushPromises()
        const switchEl = document.querySelector('[role="switch"]')
        await new DOMWrapper(switchEl as HTMLElement).trigger('click')
        await flushPromises()
        expect(mockWebPushSubscribe).toHaveBeenCalledTimes(1)
      })

      it('shows permission denied error and reverts toggle when permission is denied', async () => {
        mockWebPushSubscribe.mockRejectedValueOnce(new Error('web_push_permission_denied'))
        mountView()
        await flushPromises()
        const switchEl = document.querySelector('[role="switch"]')
        await new DOMWrapper(switchEl as HTMLElement).trigger('click')
        await flushPromises()
        expect(document.body.textContent).toContain('paramètres de votre navigateur')
        const saveBtn = Array.from(document.querySelectorAll('button')).find(
          (b) => b.textContent?.trim() === 'Enregistrer les préférences',
        )
        expect(saveBtn?.hasAttribute('disabled')).toBe(true)
      })

      it('shows not supported error and reverts toggle when browser does not support push', async () => {
        mockWebPushSubscribe.mockRejectedValueOnce(new Error('web_push_not_supported'))
        mountView()
        await flushPromises()
        const switchEl = document.querySelector('[role="switch"]')
        await new DOMWrapper(switchEl as HTMLElement).trigger('click')
        await flushPromises()
        expect(document.body.textContent).toContain('ne sont pas prises en charge')
        const saveBtn = Array.from(document.querySelectorAll('button')).find(
          (b) => b.textContent?.trim() === 'Enregistrer les préférences',
        )
        expect(saveBtn?.hasAttribute('disabled')).toBe(true)
      })
    })
  })

  describe('delete account section', () => {
    it('renders section title', async () => {
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('Supprimer mon compte')
    })
  })

  describe('delete account dialog', () => {
    async function openDeleteDialog() {
      const w = mountView()
      await flushPromises()
      const deleteBtn = w.findAll('button').find((b) => b.text() === 'Supprimer')
      await deleteBtn!.trigger('click')
      await flushPromises()
      return w
    }

    it('opens the confirmation dialog when delete button is clicked', async () => {
      const w = await openDeleteDialog()
      expect(w.findComponent({ name: 'AlertDialogRoot' }).props('open')).toBe(true)
    })

    it('calls deleteMe when confirm is clicked', async () => {
      mockDeleteMe.mockResolvedValueOnce(undefined)
      const w = await openDeleteDialog()
      await w.findComponent({ name: 'AlertDialogAction' }).trigger('click')
      await flushPromises()
      expect(mockDeleteMe).toHaveBeenCalledTimes(1)
    })

    it('does not call deleteMe when cancel is clicked', async () => {
      const w = await openDeleteDialog()
      await w.findComponent({ name: 'AlertDialogCancel' }).trigger('click')
      await flushPromises()
      expect(mockDeleteMe).not.toHaveBeenCalled()
    })
  })

  describe('password dialog', () => {
    async function openPasswordDialog() {
      const w = mountView()
      await flushPromises()
      const passwordBtn = w
        .findAll('button')
        .find((b) => b.text() === 'Modifier le mot de passe')
      await passwordBtn!.trigger('click')
      await flushPromises()
    }

    function getPasswordInputs() {
      return Array.from(document.querySelectorAll('input[type="password"]')).map(
        (el) => new DOMWrapper(el as HTMLElement),
      )
    }

    it('save button is disabled when form is empty', async () => {
      await openPasswordDialog()
      const saveBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Enregistrer' && b.hasAttribute('disabled'),
      )
      expect(saveBtn).toBeTruthy()
    })

    it('shows current password error on blur when empty', async () => {
      await openPasswordDialog()
      const inputs = getPasswordInputs()
      await inputs[0]!.trigger('blur')
      expect(document.body.textContent).toContain('Le mot de passe est requis')
    })

    it('shows password strength errors on blur for weak password', async () => {
      await openPasswordDialog()
      const inputs = getPasswordInputs()
      await inputs[1]!.setValue('short')
      await inputs[1]!.trigger('blur')
      expect(document.body.textContent).toContain('Entre 8 et 128 caractères')
    })

    it('shows mismatch error on blur when passwords differ', async () => {
      await openPasswordDialog()
      const inputs = getPasswordInputs()
      await inputs[1]!.setValue('Password1!')
      await inputs[2]!.setValue('Different1!')
      await inputs[2]!.trigger('blur')
      expect(document.body.textContent).toContain('Les mots de passe ne correspondent pas')
    })
  })
})
