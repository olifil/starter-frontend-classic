import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from '@/components/ui/card/Card.vue'
import type { SemColor } from '@/components/ui/card'

const ALL_COLORS: SemColor[] = [
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
  'light',
  'dark',
]

describe('Card', () => {
  it('renders a div with data-slot="card"', () => {
    const wrapper = mount(Card)
    expect(wrapper.find('[data-slot="card"]').exists()).toBe(true)
  })

  describe('color prop', () => {
    it('does not set data-color when color is not provided', () => {
      const wrapper = mount(Card)
      expect(wrapper.find('[data-slot="card"]').attributes('data-color')).toBeUndefined()
    })

    it.each(ALL_COLORS)('sets data-color="%s"', (color) => {
      const wrapper = mount(Card, { props: { color } })
      expect(wrapper.find('[data-slot="card"]').attributes('data-color')).toBe(color)
    })
  })

  it('renders slot content', () => {
    const wrapper = mount(Card, { slots: { default: '<p>Contenu</p>' } })
    expect(wrapper.find('p').text()).toBe('Contenu')
  })
})
