import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import DefaultLayout from '@/interface/layouts/DefaultLayout.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Child</div>' } },
      { path: '/contact', name: 'contact', component: { template: '<div />' } },
      { path: '/cgu', name: 'cgu', component: { template: '<div />' } },
    ],
  })
}

describe('DefaultLayout', () => {
  it('renders header, main and footer', () => {
    const wrapper = mount(DefaultLayout, {
      global: { plugins: [createTestRouter(), createPinia(), i18n] },
    })
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('uses min-h-screen flex layout', () => {
    const wrapper = mount(DefaultLayout, {
      global: { plugins: [createTestRouter(), createPinia(), i18n] },
    })
    const container = wrapper.find('div')
    expect(container.classes()).toContain('min-h-screen')
    expect(container.classes()).toContain('flex')
    expect(container.classes()).toContain('flex-col')
  })
})
