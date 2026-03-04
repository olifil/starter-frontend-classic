import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import LoginView from '@/interface/views/LoginView.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/connexion', name: 'connexion', component: { template: '<div />' } },
      { path: '/inscription', name: 'inscription', component: { template: '<div />' } },
      { path: '/mot-de-passe-oublie', name: 'mot-de-passe-oublie', component: { template: '<div />' } },
    ],
  })
}

function mountView() {
  return mount(LoginView, {
    global: { plugins: [createTestRouter(), createPinia(), i18n] },
  })
}

describe('LoginView', () => {
  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Connexion')
  })

  it('renders email and password fields', () => {
    const wrapper = mountView()
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('contains a link to register page', () => {
    const wrapper = mountView()
    const registerLink = wrapper.findAll('a').find((l) => l.attributes('href') === '/inscription')
    expect(registerLink).toBeTruthy()
  })

  it('contains a link to forgot password page', () => {
    const wrapper = mountView()
    const forgotLink = wrapper
      .findAll('a')
      .find((l) => l.attributes('href') === '/mot-de-passe-oublie')
    expect(forgotLink).toBeTruthy()
  })

  it('submit button is disabled when form is empty', () => {
    const wrapper = mountView()
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('shows errors on blur when fields are empty', async () => {
    const wrapper = mountView()
    await wrapper.find('input[type="email"]').trigger('blur')
    await wrapper.find('input[type="password"]').trigger('blur')
    const errors = wrapper.findAll('.text-destructive')
    expect(errors.length).toBe(2)
  })

  it('submit button is enabled when fields are filled', async () => {
    const wrapper = mountView()
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })
})
