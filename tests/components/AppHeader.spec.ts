import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import AppHeader from '@/interface/components/AppHeader.vue'

const { mockUnreadCount, mockIsAuthenticated } = vi.hoisted(() => ({
  mockUnreadCount: { __v_isRef: true, value: 0 },
  mockIsAuthenticated: { __v_isRef: true, value: true },
}))

vi.mock('@/interface/stores/notification.store', () => ({
  useNotificationStore: () => ({ unreadCount: mockUnreadCount }),
}))

vi.mock('@/interface/stores/auth.store', () => ({
  useAuthStore: () => ({
    isAuthenticated: mockIsAuthenticated,
    logout: vi.fn(),
  }),
}))

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })
}

function mountHeader() {
  return mount(AppHeader, {
    global: { plugins: [createTestRouter(), createPinia(), i18n] },
  })
}

describe('AppHeader', () => {
  beforeEach(() => {
    mockUnreadCount.value = 0
    mockIsAuthenticated.value = true
  })

  it('renders the application name', () => {
    const wrapper = mountHeader()
    expect(wrapper.text()).toContain('Starter Frontend')
  })

  it('contains a link to home', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('a').attributes('href')).toBe('/')
  })

  it('renders a header element', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('header').exists()).toBe(true)
  })

  it('renders the hamburger button', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('[aria-label="Menu"]').exists()).toBe(true)
  })

  describe('unauthenticated state', () => {
    beforeEach(() => {
      mockIsAuthenticated.value = false
    })

    it('shows the login and sign-in buttons on desktop', () => {
      const wrapper = mountHeader()
      expect(wrapper.text()).toContain('Connexion')
      expect(wrapper.text()).toContain('Inscription')
    })

    it('does not render the bell button', () => {
      const wrapper = mountHeader()
      const bells = wrapper.findAll('button').filter((b) => {
        return b.find('svg').exists() && b.text() === '' && b.attributes('aria-label') !== 'Menu'
      })
      expect(bells).toHaveLength(0)
    })

    it('does not render a badge', () => {
      mockUnreadCount.value = 5
      const wrapper = mountHeader()
      expect(wrapper.find('[data-slot="badge"]').exists()).toBe(false)
    })
  })

  describe('notification badge', () => {
    it('does not render the badge when unreadCount is 0', () => {
      mockUnreadCount.value = 0
      const wrapper = mountHeader()
      expect(wrapper.find('[data-slot="badge"]').exists()).toBe(false)
    })

    it('renders the badge with the count when unreadCount > 0', () => {
      mockUnreadCount.value = 5
      const wrapper = mountHeader()
      const badge = wrapper.find('[data-slot="badge"]')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('5')
    })

    it('renders 99+ when unreadCount exceeds 99', () => {
      mockUnreadCount.value = 100
      const wrapper = mountHeader()
      expect(wrapper.find('[data-slot="badge"]').text()).toBe('99+')
    })
  })
})
