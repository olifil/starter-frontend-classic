import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/button/Button.vue'
import type { SemColor } from '@/components/ui/button'

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

describe('Button', () => {
  it('renders a button element with data-slot="button"', () => {
    const wrapper = mount(Button)
    expect(wrapper.find('[data-slot="button"]').exists()).toBe(true)
  })

  describe('color prop', () => {
    it('does not set data-color when color is not provided', () => {
      const wrapper = mount(Button)
      expect(wrapper.find('button').attributes('data-color')).toBeUndefined()
    })

    it.each(ALL_COLORS)('sets data-color="%s"', (color) => {
      const wrapper = mount(Button, { props: { color } })
      expect(wrapper.find('button').attributes('data-color')).toBe(color)
    })
  })

  describe('variant prop', () => {
    it('defaults data-variant to "default" when variant is not provided', () => {
      const wrapper = mount(Button)
      expect(wrapper.find('button').attributes('data-variant')).toBe('default')
    })

    it.each(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const)(
      'sets data-variant="%s"',
      (variant) => {
        const wrapper = mount(Button, { props: { variant } })
        expect(wrapper.find('button').attributes('data-variant')).toBe(variant)
      },
    )
  })

  it('can combine color and variant', () => {
    const wrapper = mount(Button, { props: { color: 'info', variant: 'outline' } })
    const btn = wrapper.find('button')
    expect(btn.attributes('data-color')).toBe('info')
    expect(btn.attributes('data-variant')).toBe('outline')
  })
})
