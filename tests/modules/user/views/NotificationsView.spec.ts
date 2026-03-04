import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import NotificationsView from '@/interface/views/NotificationsView.vue'
import { NotificationPageSize, NotificationStatus, NotificationType } from '@/core/domain/types/notification.types'
import type { Notification, NotificationMeta, PaginatedNotifications } from '@/core/domain/types/notification.types'

const { mockGetNotifications, mockMarkAsRead, mockDeleteNotification } = vi.hoisted(() => ({
  mockGetNotifications: vi.fn(),
  mockMarkAsRead: vi.fn(),
  mockDeleteNotification: vi.fn(),
}))

const mockNotificationsRef = ref<PaginatedNotifications | null>(null)
const mockLastNotification = ref<unknown>(null)

vi.mock('@/interface/stores/notification.store', () => ({
  useNotificationStore: () => ({
    markAsRead: mockMarkAsRead,
    deleteNotification: mockDeleteNotification,
    getNotifications: mockGetNotifications,
    notifications: mockNotificationsRef,
    lastNotification: mockLastNotification,
  }),
}))

const pageTitle = ref('')
const pageDescription = ref('')

vi.mock('@/interface/stores/layout.store', () => ({
  useLayoutStore: () => ({ pageTitle, pageDescription }),
}))

vi.mock('@/components/ui/dropdown-menu/DropdownMenuContent.vue', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    default: defineComponent({
      name: 'DropdownMenuContent',
      setup(_, { slots }) {
        return () => h('div', { 'data-slot': 'dropdown-menu-content' }, slots.default?.())
      },
    }),
  }
})

vi.mock('@/components/ui/dropdown-menu/DropdownMenuItem.vue', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    default: defineComponent({
      name: 'DropdownMenuItem',
      props: { disabled: Boolean },
      emits: ['select'],
      setup(_, { slots }) {
        return () => h('div', { 'data-slot': 'dropdown-menu-item' }, slots.default?.())
      },
    }),
  }
})

const notifSent: Notification = {
  id: '1',
  userId: 'u1',
  type: 'INFO',
  channel: NotificationType.WEBSOCKET,
  status: NotificationStatus.SENT,
  subject: 'Bienvenue',
  body: 'Corps du message',
  sentAt: '2026-02-27T10:00:00.000Z',
  createdAt: '2026-02-27T10:00:00.000Z',
}

const notifRead: Notification = {
  id: '2',
  userId: 'u1',
  type: 'INFO',
  channel: NotificationType.WEBSOCKET,
  status: NotificationStatus.READ,
  subject: 'Mise à jour disponible',
  body: 'Corps du message 2',
  sentAt: '2026-02-26T08:30:00.000Z',
  createdAt: '2026-02-26T08:30:00.000Z',
}

const mockNotifications: Notification[] = [notifSent, notifRead]

function makeMeta(overrides: Partial<NotificationMeta> = {}): NotificationMeta {
  return {
    currentPage: 1,
    pageSize: 10,
    totalItems: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    ...overrides,
  }
}

function makePaginated(
  data: Notification[],
  metaOverrides: Partial<NotificationMeta> = {},
): PaginatedNotifications {
  return { data: data.map((n) => ({ ...n })), meta: makeMeta(metaOverrides) }
}

/** Configure mockGetNotifications pour mettre à jour le ref et rendre le template. */
function setupFetch(data: PaginatedNotifications) {
  mockGetNotifications.mockImplementationOnce(async () => {
    mockNotificationsRef.value = data
  })
}

let wrapper: ReturnType<typeof mount> | null = null

function mountView() {
  wrapper = mount(NotificationsView, {
    global: { plugins: [createPinia(), i18n] },
  })
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  mockNotificationsRef.value = null
  mockLastNotification.value = null
  pageTitle.value = ''
  pageDescription.value = ''
  mockDeleteNotification.mockResolvedValue(undefined)
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
})

describe('NotificationsView', () => {
  describe('on mount', () => {
    it('sets pageTitle', async () => {
      setupFetch(makePaginated(mockNotifications))
      mountView()
      await flushPromises()
      expect(pageTitle.value).toBe('Notifications')
    })

    it('calls getNotifications with page=1 and the default page size', async () => {
      setupFetch(makePaginated(mockNotifications))
      mountView()
      await flushPromises()
      expect(mockGetNotifications).toHaveBeenCalledWith(1, NotificationPageSize.Default)
    })
  })

  describe('empty state', () => {
    it('shows the empty message when no notifications are returned', async () => {
      setupFetch(makePaginated([]))
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('Aucune notification à afficher')
    })

    it('does not show the empty message when notifications exist', async () => {
      setupFetch(makePaginated(mockNotifications))
      const w = mountView()
      await flushPromises()
      expect(w.text()).not.toContain('Aucune notification à afficher')
    })
  })

  describe('notification cards', () => {
    it('renders one card per notification', async () => {
      setupFetch(makePaginated(mockNotifications))
      const w = mountView()
      await flushPromises()
      expect(w.findAll('[data-slot="card"]').length).toBe(2)
    })

    it('displays the subject of each notification', async () => {
      setupFetch(makePaginated(mockNotifications))
      const w = mountView()
      await flushPromises()
      expect(w.text()).toContain('Bienvenue')
      expect(w.text()).toContain('Mise à jour disponible')
    })

    it('displays the formatted sentAt date', async () => {
      setupFetch(makePaginated([notifSent]))
      const w = mountView()
      await flushPromises()
      expect(w.text()).toMatch(/2026/)
    })

    it('does not render sentAt when it is absent', async () => {
      const notifWithoutDate: Notification = { ...notifSent, sentAt: undefined } as Notification
      setupFetch(makePaginated([notifWithoutDate]))
      const w = mountView()
      await flushPromises()
      expect(w.find('[data-slot="card-description"]').exists()).toBe(false)
    })
  })

  describe('color prop', () => {
    it('sets data-color="info" on cards with status SENT', async () => {
      setupFetch(makePaginated([notifSent]))
      const w = mountView()
      await flushPromises()
      const card = w.find('[data-slot="card"]')
      expect(card.attributes('data-color')).toBe('info')
    })

    it('does not set data-color on cards with status READ', async () => {
      setupFetch(makePaginated([notifRead]))
      const w = mountView()
      await flushPromises()
      const card = w.find('[data-slot="card"]')
      expect(card.attributes('data-color')).toBeUndefined()
    })
  })

  describe('notification dialog', () => {
    it('opens the dialog when a card is clicked', async () => {
      setupFetch(makePaginated(mockNotifications))
      const w = mountView()
      await flushPromises()

      // AlertDialogRoot wraps DialogRoot internally, so we scope to our Dialog wrapper
      const dialogRoot = w.findComponent({ name: 'Dialog' }).findComponent({ name: 'DialogRoot' })
      expect(dialogRoot.props('open')).toBe(false)

      await w.find('[data-slot="card"]').trigger('click')
      expect(dialogRoot.props('open')).toBe(true)
    })

    it('calls markAsRead when a SENT notification is clicked', async () => {
      setupFetch(makePaginated([notifSent]))
      mockMarkAsRead.mockResolvedValueOnce(undefined)
      const w = mountView()
      await flushPromises()

      await w.find('[data-slot="card"]').trigger('click')
      await flushPromises()

      expect(mockMarkAsRead).toHaveBeenCalledWith('1')
    })

    it('does not call markAsRead when a READ notification is clicked', async () => {
      setupFetch(makePaginated([notifRead]))
      const w = mountView()
      await flushPromises()

      await w.find('[data-slot="card"]').trigger('click')
      await flushPromises()

      expect(mockMarkAsRead).not.toHaveBeenCalled()
    })

    it('removes the info color after clicking a SENT notification', async () => {
      setupFetch(makePaginated([notifSent]))
      mockMarkAsRead.mockResolvedValueOnce(undefined)
      const w = mountView()
      await flushPromises()

      const card = w.find('[data-slot="card"]')
      expect(card.attributes('data-color')).toBe('info')

      await card.trigger('click')
      await flushPromises()

      expect(card.attributes('data-color')).toBeUndefined()
    })
  })

  describe('dropdown menu', () => {
    it('renders a dropdown trigger on each card', async () => {
      setupFetch(makePaginated(mockNotifications))
      const w = mountView()
      await flushPromises()
      expect(w.findAll('[data-slot="dropdown-menu-trigger"]').length).toBe(2)
    })

    it('does not open the dialog when the dropdown trigger is clicked', async () => {
      setupFetch(makePaginated([notifSent]))
      const w = mountView()
      await flushPromises()

      const dialogRoot = w.findComponent({ name: 'Dialog' }).findComponent({ name: 'DialogRoot' })
      await w.find('[data-slot="dropdown-menu-trigger"]').trigger('click')
      expect(dialogRoot.props('open')).toBe(false)
    })

    it('opens the dialog when "Ouvrir" is selected', async () => {
      setupFetch(makePaginated([notifSent]))
      const w = mountView()
      await flushPromises()

      const dialogRoot = w.findComponent({ name: 'Dialog' }).findComponent({ name: 'DialogRoot' })
      const menuItems = w.findAllComponents({ name: 'DropdownMenuItem' })
      await menuItems[0]!.vm.$emit('select')
      expect(dialogRoot.props('open')).toBe(true)
    })

    it('"Marquer comme lue" is always visible but disabled for READ notifications', async () => {
      setupFetch(makePaginated(mockNotifications))
      const w = mountView()
      await flushPromises()

      // 3 items per notification × 2 notifications = 6 total
      const menuItems = w.findAllComponents({ name: 'DropdownMenuItem' })
      expect(menuItems.length).toBe(6)

      // notifSent (indices 0-2): "Marquer comme lue" at index 1 — not disabled
      expect(menuItems[1]!.props('disabled')).toBe(false)
      // notifRead (indices 3-5): "Marquer comme lue" at index 4 — disabled
      expect(menuItems[4]!.props('disabled')).toBe(true)
    })

    it('calls markAsRead and removes info color when "Marquer comme lue" is selected', async () => {
      setupFetch(makePaginated([notifSent]))
      mockMarkAsRead.mockResolvedValueOnce(undefined)
      const w = mountView()
      await flushPromises()

      const card = w.find('[data-slot="card"]')
      expect(card.attributes('data-color')).toBe('info')

      const menuItems = w.findAllComponents({ name: 'DropdownMenuItem' })
      await menuItems[1]!.vm.$emit('select') // "Marquer comme lue"
      await flushPromises()

      expect(mockMarkAsRead).toHaveBeenCalledWith('1')
      expect(card.attributes('data-color')).toBeUndefined()
    })
  })

  describe('delete confirmation dialog', () => {
    it('clicking "Supprimer" opens the confirmation dialog', async () => {
      setupFetch(makePaginated([notifSent]))
      const w = mountView()
      await flushPromises()

      const alertDialogRoot = w.findComponent({ name: 'AlertDialogRoot' })
      expect(alertDialogRoot.props('open')).toBe(false)

      const menuItems = w.findAllComponents({ name: 'DropdownMenuItem' })
      await menuItems[menuItems.length - 1]!.vm.$emit('select')

      expect(alertDialogRoot.props('open')).toBe(true)
    })

    it('confirming calls deleteNotification with the correct arguments', async () => {
      setupFetch(makePaginated([notifSent]))
      setupFetch(makePaginated([]))
      const w = mountView()
      await flushPromises()

      // Ouvrir le dialog de confirmation
      const menuItems = w.findAllComponents({ name: 'DropdownMenuItem' })
      await menuItems[menuItems.length - 1]!.vm.$emit('select')

      // Confirmer
      await w.findComponent({ name: 'AlertDialogAction' }).trigger('click')
      await flushPromises()

      expect(mockDeleteNotification).toHaveBeenCalledWith('1', true)
    })

    it('confirming re-fetches the current page after deletion', async () => {
      setupFetch(makePaginated([notifSent]))
      setupFetch(makePaginated([]))
      const w = mountView()
      await flushPromises()

      const menuItems = w.findAllComponents({ name: 'DropdownMenuItem' })
      await menuItems[menuItems.length - 1]!.vm.$emit('select')

      await w.findComponent({ name: 'AlertDialogAction' }).trigger('click')
      await flushPromises()

      expect(mockGetNotifications).toHaveBeenCalledTimes(2)
    })

    it('cancelling does not call deleteNotification', async () => {
      setupFetch(makePaginated([notifSent]))
      const w = mountView()
      await flushPromises()

      const menuItems = w.findAllComponents({ name: 'DropdownMenuItem' })
      await menuItems[menuItems.length - 1]!.vm.$emit('select')

      await w.findComponent({ name: 'AlertDialogCancel' }).trigger('click')
      await flushPromises()

      expect(mockDeleteNotification).not.toHaveBeenCalled()
    })
  })

  describe('page size selector', () => {
    it('calls getNotifications with the new page size and resets to page 1', async () => {
      setupFetch(makePaginated(mockNotifications))
      const w = mountView()
      await flushPromises()
      vi.clearAllMocks()
      setupFetch(makePaginated(mockNotifications))

      // Le premier SelectRoot est celui des actions de groupe, le second est le sélecteur de taille
      const pageSizeSelectRoot = w.findAllComponents({ name: 'SelectRoot' })[1]!
      await pageSizeSelectRoot.vm.$emit('update:modelValue', String(NotificationPageSize.Medium))
      await flushPromises()

      expect(mockGetNotifications).toHaveBeenCalledWith(1, NotificationPageSize.Medium)
    })
  })

  describe('bulk actions toolbar', () => {
    describe('visibility', () => {
      it('shows the bulk action select when notifications exist', async () => {
        setupFetch(makePaginated(mockNotifications))
        const w = mountView()
        await flushPromises()
        // Le premier SelectRoot est celui des actions de groupe
        expect(w.findAllComponents({ name: 'SelectRoot' }).length).toBe(2)
      })

      it('does not show the bulk action toolbar when the list is empty', async () => {
        setupFetch(makePaginated([]))
        const w = mountView()
        await flushPromises()
        // Seul le sélecteur de taille de page subsiste (1 SelectRoot), pas celui des actions de groupe
        expect(w.findAllComponents({ name: 'SelectRoot' }).length).toBe(1)
        // Aucune checkbox (ni toolbar, ni par carte)
        expect(w.findAllComponents({ name: 'CheckboxRoot' }).length).toBe(0)
      })
    })

    describe('select all checkbox', () => {
      it('renders one checkbox per card plus the select-all checkbox', async () => {
        setupFetch(makePaginated(mockNotifications))
        const w = mountView()
        await flushPromises()
        // 2 notifications + 1 select-all = 3 CheckboxRoot
        expect(w.findAllComponents({ name: 'CheckboxRoot' }).length).toBe(3)
      })

      it('selecting all via the select-all checkbox marks all cards as selected', async () => {
        setupFetch(makePaginated(mockNotifications))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[0]!.vm.$emit('update:modelValue', true)
        await nextTick()

        expect(checkboxRoots[1]!.props('modelValue')).toBe(true)
        expect(checkboxRoots[2]!.props('modelValue')).toBe(true)
      })

      it('deselecting all clears all selections', async () => {
        setupFetch(makePaginated(mockNotifications))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[0]!.vm.$emit('update:modelValue', true)
        await nextTick()
        await checkboxRoots[0]!.vm.$emit('update:modelValue', false)
        await nextTick()

        expect(checkboxRoots[1]!.props('modelValue')).toBe(false)
        expect(checkboxRoots[2]!.props('modelValue')).toBe(false)
      })

      it('shows "indeterminate" on the select-all checkbox when only some are selected', async () => {
        setupFetch(makePaginated(mockNotifications))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[1]!.vm.$emit('update:modelValue', true)
        await nextTick()

        expect(checkboxRoots[0]!.props('modelValue')).toBe('indeterminate')
      })

      it('shows "checked" on the select-all checkbox when all cards are selected', async () => {
        setupFetch(makePaginated(mockNotifications))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[1]!.vm.$emit('update:modelValue', true)
        await checkboxRoots[2]!.vm.$emit('update:modelValue', true)
        await nextTick()

        expect(checkboxRoots[0]!.props('modelValue')).toBe(true)
      })
    })

    describe('selected count badge', () => {
      it('shows the selected count when at least one notification is selected', async () => {
        setupFetch(makePaginated(mockNotifications))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[1]!.vm.$emit('update:modelValue', true)
        await nextTick()

        expect(w.text()).toContain('1 sélectionnée(s)')
      })

      it('updates the count as more notifications are selected', async () => {
        setupFetch(makePaginated(mockNotifications))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[1]!.vm.$emit('update:modelValue', true)
        await checkboxRoots[2]!.vm.$emit('update:modelValue', true)
        await nextTick()

        expect(w.text()).toContain('2 sélectionnée(s)')
      })

      it('does not show the count when nothing is selected', async () => {
        setupFetch(makePaginated(mockNotifications))
        const w = mountView()
        await flushPromises()

        expect(w.text()).not.toContain('sélectionnée(s)')
      })
    })

    describe('bulk mark as read', () => {
      it('calls markAsRead only for SENT notifications in the selection', async () => {
        setupFetch(makePaginated([notifSent, notifRead]))
        mockMarkAsRead.mockResolvedValue(undefined)
        const w = mountView()
        await flushPromises()

        // Sélectionner tout
        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[0]!.vm.$emit('update:modelValue', true)

        const bulkSelectRoot = w.findAllComponents({ name: 'SelectRoot' })[0]!
        await bulkSelectRoot.vm.$emit('update:modelValue', 'markAsRead')
        await nextTick()

        await w.findAll('button').find((b) => b.text() === 'Appliquer')!.trigger('click')
        await flushPromises()

        // Seule la notification SENT doit être marquée comme lue
        expect(mockMarkAsRead).toHaveBeenCalledTimes(1)
        expect(mockMarkAsRead).toHaveBeenCalledWith('1')
      })

      it('clears selection and resets action after bulk mark as read', async () => {
        setupFetch(makePaginated([notifSent]))
        mockMarkAsRead.mockResolvedValue(undefined)
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[0]!.vm.$emit('update:modelValue', true)

        const bulkSelectRoot = w.findAllComponents({ name: 'SelectRoot' })[0]!
        await bulkSelectRoot.vm.$emit('update:modelValue', 'markAsRead')
        await nextTick()

        await w.findAll('button').find((b) => b.text() === 'Appliquer')!.trigger('click')
        await flushPromises()

        expect(w.text()).not.toContain('sélectionnée(s)')
      })
    })

    describe('bulk delete', () => {
      it('clicking Apply with "delete" opens the bulk confirmation dialog', async () => {
        setupFetch(makePaginated([notifSent]))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[1]!.vm.$emit('update:modelValue', true)

        const bulkSelectRoot = w.findAllComponents({ name: 'SelectRoot' })[0]!
        await bulkSelectRoot.vm.$emit('update:modelValue', 'delete')
        await nextTick()

        // Les deux AlertDialogRoot doivent être fermés avant d'appuyer sur Appliquer
        const alertRoots = w.findAllComponents({ name: 'AlertDialogRoot' })
        alertRoots.forEach((r) => expect(r.props('open')).toBe(false))

        await w.findAll('button').find((b) => b.text() === 'Appliquer')!.trigger('click')

        // Le second AlertDialogRoot (suppression de groupe) doit être ouvert
        expect(w.findAllComponents({ name: 'AlertDialogRoot' })[1]!.props('open')).toBe(true)
      })

      it('confirming bulk delete calls deleteNotification for each selected notification', async () => {
        setupFetch(makePaginated([notifSent, notifRead]))
        setupFetch(makePaginated([]))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[0]!.vm.$emit('update:modelValue', true) // sélectionner tout

        const bulkSelectRoot = w.findAllComponents({ name: 'SelectRoot' })[0]!
        await bulkSelectRoot.vm.$emit('update:modelValue', 'delete')
        await nextTick()

        await w.findAll('button').find((b) => b.text() === 'Appliquer')!.trigger('click')
        await w.findComponent({ name: 'AlertDialogAction' }).trigger('click')
        await flushPromises()

        expect(mockDeleteNotification).toHaveBeenCalledWith('1', true)  // SENT
        expect(mockDeleteNotification).toHaveBeenCalledWith('2', false) // READ
        expect(mockDeleteNotification).toHaveBeenCalledTimes(2)
      })

      it('confirming bulk delete re-fetches the list', async () => {
        setupFetch(makePaginated([notifSent]))
        setupFetch(makePaginated([]))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[1]!.vm.$emit('update:modelValue', true)

        const bulkSelectRoot = w.findAllComponents({ name: 'SelectRoot' })[0]!
        await bulkSelectRoot.vm.$emit('update:modelValue', 'delete')
        await nextTick()

        await w.findAll('button').find((b) => b.text() === 'Appliquer')!.trigger('click')
        await w.findComponent({ name: 'AlertDialogAction' }).trigger('click')
        await flushPromises()

        expect(mockGetNotifications).toHaveBeenCalledTimes(2)
      })

      it('confirming bulk delete clears the selection', async () => {
        setupFetch(makePaginated([notifSent]))
        setupFetch(makePaginated([notifRead]))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[1]!.vm.$emit('update:modelValue', true)
        await nextTick()
        expect(w.text()).toContain('1 sélectionnée(s)')

        const bulkSelectRoot = w.findAllComponents({ name: 'SelectRoot' })[0]!
        await bulkSelectRoot.vm.$emit('update:modelValue', 'delete')
        await nextTick()

        await w.findAll('button').find((b) => b.text() === 'Appliquer')!.trigger('click')
        await w.findComponent({ name: 'AlertDialogAction' }).trigger('click')
        await flushPromises()

        expect(w.text()).not.toContain('sélectionnée(s)')
      })

      it('cancelling bulk delete does not call deleteNotification', async () => {
        setupFetch(makePaginated([notifSent]))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[1]!.vm.$emit('update:modelValue', true)

        const bulkSelectRoot = w.findAllComponents({ name: 'SelectRoot' })[0]!
        await bulkSelectRoot.vm.$emit('update:modelValue', 'delete')
        await nextTick()

        await w.findAll('button').find((b) => b.text() === 'Appliquer')!.trigger('click')
        await w.findComponent({ name: 'AlertDialogCancel' }).trigger('click')
        await flushPromises()

        expect(mockDeleteNotification).not.toHaveBeenCalled()
      })
    })

    describe('selection reset', () => {
      it('clears selection when the page changes', async () => {
        setupFetch(makePaginated(mockNotifications, { totalPages: 3, totalItems: 25 }))
        setupFetch(makePaginated(mockNotifications, { totalPages: 3, totalItems: 25 }))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[1]!.vm.$emit('update:modelValue', true)
        await nextTick()
        expect(w.text()).toContain('1 sélectionnée(s)')

        const pagination = w.findComponent({ name: 'PaginationRoot' })
        await pagination.vm.$emit('update:page', 2)
        await flushPromises()

        expect(w.text()).not.toContain('sélectionnée(s)')
      })

      it('clears selection when the page size changes', async () => {
        setupFetch(makePaginated(mockNotifications))
        setupFetch(makePaginated(mockNotifications))
        const w = mountView()
        await flushPromises()

        const checkboxRoots = w.findAllComponents({ name: 'CheckboxRoot' })
        await checkboxRoots[1]!.vm.$emit('update:modelValue', true)
        await nextTick()
        expect(w.text()).toContain('1 sélectionnée(s)')

        const pageSizeSelectRoot = w.findAllComponents({ name: 'SelectRoot' })[1]!
        await pageSizeSelectRoot.vm.$emit('update:modelValue', String(NotificationPageSize.Medium))
        await flushPromises()

        expect(w.text()).not.toContain('sélectionnée(s)')
      })
    })
  })
})
