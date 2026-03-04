import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/i18n'
import MentionsLegalesView from '@/interface/views/MentionsLegalesView.vue'

function mountView() {
  return mount(MentionsLegalesView, { global: { plugins: [i18n] } })
}

describe('MentionsLegalesView', () => {
  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('h1').text()).toContain('Mentions légales')
  })

  it('renders 6 sections', () => {
    const wrapper = mountView()
    expect(wrapper.findAll('section')).toHaveLength(6)
  })

  it('each section has a title and content', () => {
    const wrapper = mountView()
    for (const section of wrapper.findAll('section')) {
      expect(section.find('h2').exists()).toBe(true)
      expect(section.find('p').exists()).toBe(true)
    }
  })
})
