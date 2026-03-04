import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Empty from '@/components/ui/empty/Empty.vue'

describe('Empty', () => {
  it('renders the default slot content', () => {
    const wrapper = mount(Empty, { slots: { default: 'Aucun résultat' } })
    expect(wrapper.text()).toContain('Aucun résultat')
  })

  describe('icon slot', () => {
    it('renders the icon slot when provided', () => {
      const wrapper = mount(Empty, {
        slots: { icon: '<svg data-testid="icon" />' },
      })
      expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
    })

    it('does not render the icon wrapper when the slot is absent', () => {
      const wrapper = mount(Empty)
      // Le seul div de l'icône a la classe "mb-4"
      expect(wrapper.find('.mb-4').exists()).toBe(false)
    })
  })

  describe('description slot', () => {
    it('renders the description slot when provided', () => {
      const wrapper = mount(Empty, {
        slots: { description: 'Description ici' },
      })
      expect(wrapper.text()).toContain('Description ici')
    })

    it('does not render the description paragraph when the slot is absent', () => {
      const wrapper = mount(Empty, { slots: { default: 'Titre' } })
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBe(1)
    })
  })

  describe('action slot', () => {
    it('renders the action slot when provided', () => {
      const wrapper = mount(Empty, {
        slots: { action: '<button>Réessayer</button>' },
      })
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('button').text()).toBe('Réessayer')
    })

    it('does not render the action wrapper when the slot is absent', () => {
      const wrapper = mount(Empty)
      expect(wrapper.find('button').exists()).toBe(false)
      expect(wrapper.find('.mt-4').exists()).toBe(false)
    })
  })

  describe('class prop', () => {
    it('applies a custom class to the root element', () => {
      const wrapper = mount(Empty, { props: { class: 'my-custom-class' } })
      expect(wrapper.classes()).toContain('my-custom-class')
    })

    it('keeps the base classes alongside the custom class', () => {
      const wrapper = mount(Empty, { props: { class: 'my-custom-class' } })
      expect(wrapper.classes()).toContain('flex')
      expect(wrapper.classes()).toContain('text-center')
    })
  })
})
