import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import RegisterView from '@/interface/views/RegisterView.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/connexion', name: 'connexion', component: { template: '<div />' } },
      { path: '/inscription', name: 'inscription', component: { template: '<div />' } },
      { path: '/cgu', name: 'cgu', component: { template: '<div />' } },
    ],
  })
}

function mountView() {
  return mount(RegisterView, {
    global: { plugins: [createTestRouter(), createPinia(), i18n] },
  })
}

async function fillValidForm(wrapper: ReturnType<typeof mountView>) {
  const textInputs = wrapper.findAll('input[type="text"]')
  await textInputs[0]!.setValue('Jean')
  await textInputs[1]!.setValue('Dupont')
  await wrapper.find('input[type="email"]').setValue('test@example.com')
  const passwordInputs = wrapper.findAll('input[type="password"]')
  await passwordInputs[0]!.setValue('Password1!')
  await passwordInputs[1]!.setValue('Password1!')
}

describe('RegisterView', () => {
  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Inscription')
  })

  it('renders first name, last name, email, password, confirmation and terms fields', () => {
    const wrapper = mountView()
    const textFields = wrapper.findAll('input[type="text"]')
    expect(textFields).toHaveLength(2)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    const passwordFields = wrapper.findAll('input[type="password"]')
    expect(passwordFields).toHaveLength(2)
    expect(wrapper.find('[data-slot="checkbox"]').exists()).toBe(true)
  })

  it('contains a link to login page', () => {
    const wrapper = mountView()
    const loginLink = wrapper.findAll('a').find((l) => l.attributes('href') === '/connexion')
    expect(loginLink).toBeTruthy()
  })

  it('contains a link to the cgu page', () => {
    const wrapper = mountView()
    const cguLink = wrapper.findAll('a').find((l) => l.attributes('href') === '/cgu')
    expect(cguLink).toBeTruthy()
  })

  it('submit button is disabled when form is empty', () => {
    const wrapper = mountView()
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('shows password-specific errors on blur for weak password', async () => {
    const wrapper = mountView()
    const passwordInputs = wrapper.findAll('input[type="password"]')
    await passwordInputs[0]!.setValue('short')
    await passwordInputs[0]!.trigger('blur')
    expect(wrapper.text()).toContain('Entre 8 et 128 caractères')
  })

  it('shows mismatch error on blur when passwords differ', async () => {
    const wrapper = mountView()
    const passwordInputs = wrapper.findAll('input[type="password"]')
    await passwordInputs[0]!.setValue('Password1!')
    await passwordInputs[1]!.setValue('Different1!')
    await passwordInputs[1]!.trigger('blur')
    expect(wrapper.text()).toContain('Les mots de passe ne correspondent pas')
  })

  it('submit button remains disabled when all fields are filled but terms not accepted', async () => {
    const wrapper = mountView()
    await fillValidForm(wrapper)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('submit button is enabled when form is valid and terms accepted', async () => {
    const wrapper = mountView()
    await fillValidForm(wrapper)
    await wrapper.find('[data-slot="checkbox"]').trigger('click')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })
})
