import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/i18n'
import AppFooter from '@/interface/components/AppFooter.vue'

describe('AppFooter', () => {
  it('renders a footer element', () => {
    const wrapper = mount(AppFooter, { global: { plugins: [i18n] } })
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('displays the current year', () => {
    const wrapper = mount(AppFooter, { global: { plugins: [i18n] } })
    const currentYear = new Date().getFullYear().toString()
    expect(wrapper.text()).toContain(currentYear)
  })

  it('displays the application name', () => {
    const wrapper = mount(AppFooter, { global: { plugins: [i18n] } })
    expect(wrapper.text()).toContain('Starter Frontend')
  })

  it('displays a link to the legal notice page', () => {
    const wrapper = mount(AppFooter, { global: { plugins: [i18n] } })
    expect(wrapper.text()).toContain('Mentions légales')
  })
})
