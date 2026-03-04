import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import ForgotPasswordView from '@/interface/views/ForgotPasswordView.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/connexion', name: 'connexion', component: { template: '<div />' } },
      { path: '/mot-de-passe-oublie', name: 'mot-de-passe-oublie', component: { template: '<div />' } },
    ],
  })
}

function mountView() {
  return mount(ForgotPasswordView, {
    global: { plugins: [createTestRouter(), createPinia(), i18n] },
  })
}

describe('ForgotPasswordView', () => {
  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Mot de passe oublié')
  })

  it('renders an email field', () => {
    const wrapper = mountView()
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('contains a link back to login page', () => {
    const wrapper = mountView()
    const loginLink = wrapper.findAll('a').find((l) => l.attributes('href') === '/connexion')
    expect(loginLink).toBeTruthy()
  })

  it('submit button is disabled when email is empty', () => {
    const wrapper = mountView()
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('shows error on blur when email is empty', async () => {
    const wrapper = mountView()
    await wrapper.find('input[type="email"]').trigger('blur')
    expect(wrapper.find('.text-destructive').exists()).toBe(true)
  })

  it('submit button is enabled when email is filled', async () => {
    const wrapper = mountView()
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })
})
