import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import i18n from '@/i18n'
import HomeView from '@/interface/views/HomeView.vue'

const { mockIsAuthenticated } = vi.hoisted(() => ({
  mockIsAuthenticated: { __v_isRef: true, value: false },
}))

vi.mock('@/interface/stores/auth.store', () => ({
  useAuthStore: () => ({ isAuthenticated: mockIsAuthenticated }),
}))

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/connexion', name: 'connexion', component: { template: '<div />' } },
      { path: '/inscription', name: 'inscription', component: { template: '<div />' } },
      { path: '/profil', name: 'profil', component: { template: '<div />' } },
    ],
  })
}

function mountView() {
  return mount(HomeView, {
    global: { plugins: [createTestRouter(), i18n] },
  })
}

describe('HomeView', () => {
  beforeEach(() => {
    mockIsAuthenticated.value = false
  })

  describe('Hero section', () => {
    it('renders the title', () => {
      const wrapper = mountView()
      expect(wrapper.find('h1').text()).toBe('Starter Frontend')
    })

    it('renders the description', () => {
      const wrapper = mountView()
      expect(wrapper.find('p').text()).toBeTruthy()
    })
  })

  describe('Hero CTA — unauthenticated', () => {
    it('contains a link to the login page', () => {
      const wrapper = mountView()
      const link = wrapper.findAll('a').find((l) => l.attributes('href') === '/connexion')
      expect(link).toBeTruthy()
    })

    it('contains a link to the register page', () => {
      const wrapper = mountView()
      const link = wrapper.findAll('a').find((l) => l.attributes('href') === '/inscription')
      expect(link).toBeTruthy()
    })

    it('does not show a link to the profile page', () => {
      const wrapper = mountView()
      const link = wrapper.findAll('a').find((l) => l.attributes('href') === '/profil')
      expect(link).toBeUndefined()
    })
  })

  describe('Hero CTA — authenticated', () => {
    beforeEach(() => {
      mockIsAuthenticated.value = true
    })

    it('contains a link to the profile page', () => {
      const wrapper = mountView()
      const link = wrapper.findAll('a').find((l) => l.attributes('href') === '/profil')
      expect(link).toBeTruthy()
    })

    it('does not show a link to the login page', () => {
      const wrapper = mountView()
      const link = wrapper.findAll('a').find((l) => l.attributes('href') === '/connexion')
      expect(link).toBeUndefined()
    })

    it('does not show a link to the register page', () => {
      const wrapper = mountView()
      const link = wrapper.findAll('a').find((l) => l.attributes('href') === '/inscription')
      expect(link).toBeUndefined()
    })
  })

  describe('Stack section', () => {
    it('renders 10 tech stack badges', () => {
      const wrapper = mountView()
      expect(wrapper.findAll('[data-slot="badge"]')).toHaveLength(10)
    })

    it('includes Vue and TypeScript in the stack', () => {
      const wrapper = mountView()
      const text = wrapper.text()
      expect(text).toContain('Vue')
      expect(text).toContain('TypeScript')
    })
  })

  describe('Features section', () => {
    it('renders the features title', () => {
      const wrapper = mountView()
      expect(wrapper.find('h2').text()).toBe('Fonctionnalités incluses')
    })

    it('renders 6 feature cards', () => {
      const wrapper = mountView()
      expect(wrapper.findAll('[data-slot="card"]')).toHaveLength(6)
    })

    it('each card has a non-empty title and description', () => {
      const wrapper = mountView()
      for (const card of wrapper.findAll('[data-slot="card"]')) {
        expect(card.find('[data-slot="card-title"]').text()).toBeTruthy()
        expect(card.find('[data-slot="card-description"]').text()).toBeTruthy()
      }
    })
  })
})
