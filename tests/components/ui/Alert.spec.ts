import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Alert from '@/components/ui/alert/Alert.vue'
import type { SemColor } from '@/components/ui/alert'

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

describe('Alert', () => {
  it('renders a div with data-slot="alert" and role="alert"', () => {
    const wrapper = mount(Alert)
    const el = wrapper.find('[data-slot="alert"]')
    expect(el.exists()).toBe(true)
    expect(el.attributes('role')).toBe('alert')
  })

  describe('color prop', () => {
    it('does not set data-color when color is not provided', () => {
      const wrapper = mount(Alert)
      expect(wrapper.find('[data-slot="alert"]').attributes('data-color')).toBeUndefined()
    })

    it.each(ALL_COLORS)('sets data-color="%s"', (color) => {
      const wrapper = mount(Alert, { props: { color } })
      expect(wrapper.find('[data-slot="alert"]').attributes('data-color')).toBe(color)
    })
  })

  describe('variant prop', () => {
    it('applies destructive variant when variant="destructive"', () => {
      const wrapper = mount(Alert, { props: { variant: 'destructive' } })
      expect(wrapper.find('[data-slot="alert"]').classes()).toContain('text-destructive')
    })

    it('can combine color and variant', () => {
      const wrapper = mount(Alert, { props: { color: 'error', variant: 'destructive' } })
      const el = wrapper.find('[data-slot="alert"]')
      expect(el.attributes('data-color')).toBe('error')
      expect(el.classes()).toContain('text-destructive')
    })
  })

  it('renders slot content', () => {
    const wrapper = mount(Alert, { slots: { default: '<p>Message</p>' } })
    expect(wrapper.find('p').text()).toBe('Message')
  })
})
