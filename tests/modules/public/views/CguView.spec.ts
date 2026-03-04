import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/i18n'
import CguView from '@/interface/views/CguView.vue'

function mountView() {
  return mount(CguView, { global: { plugins: [i18n] } })
}

describe('CguView', () => {
  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('h1').text()).toContain("Conditions Générales d'Utilisation")
  })

  it('renders 10 sections', () => {
    const wrapper = mountView()
    expect(wrapper.findAll('section')).toHaveLength(10)
  })

  it('each section has a title and content', () => {
    const wrapper = mountView()
    for (const section of wrapper.findAll('section')) {
      expect(section.find('h2').exists()).toBe(true)
      expect(section.find('p').exists()).toBe(true)
    }
  })
})
