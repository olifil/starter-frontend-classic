import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import AppBulkActionsToolbar from '@/interface/components/AppBulkActionsToolbar.vue'

const ACTIONS = [
  { value: 'markAsRead', label: 'Marquer comme lue' },
  { value: 'delete', label: 'Supprimer' },
]

function mountToolbar(props: Record<string, unknown> = {}) {
  return mount(AppBulkActionsToolbar, {
    props: {
      allSelected: false,
      someSelected: false,
      selectedCount: 0,
      actions: ACTIONS,
      placeholder: 'Sélectionner une action',
      applyLabel: 'Appliquer',
      ...props,
    },
    global: { plugins: [createPinia(), i18n] },
  })
}

describe('AppBulkActionsToolbar', () => {
  describe('select-all checkbox', () => {
    it('passes true when allSelected is true', () => {
      const w = mountToolbar({ allSelected: true })
      expect(w.findComponent({ name: 'CheckboxRoot' }).props('modelValue')).toBe(true)
    })

    it('passes indeterminate when someSelected is true', () => {
      const w = mountToolbar({ someSelected: true })
      expect(w.findComponent({ name: 'CheckboxRoot' }).props('modelValue')).toBe('indeterminate')
    })

    it('passes false when neither allSelected nor someSelected', () => {
      const w = mountToolbar()
      expect(w.findComponent({ name: 'CheckboxRoot' }).props('modelValue')).toBe(false)
    })

    it('emits toggleSelectAll when the checkbox value changes', async () => {
      const w = mountToolbar()
      await w.findComponent({ name: 'CheckboxRoot' }).vm.$emit('update:modelValue', true)
      expect(w.emitted('toggleSelectAll')).toHaveLength(1)
    })
  })

  describe('apply button', () => {
    it('is disabled when no action is selected and selectedCount is 0', () => {
      const w = mountToolbar({ selectedCount: 0 })
      const applyBtn = w.findAll('button').find((b) => b.text() === 'Appliquer')
      expect(applyBtn!.element.disabled).toBe(true)
    })

    it('is disabled when an action is chosen but selectedCount is 0', async () => {
      const w = mountToolbar({ selectedCount: 0 })
      await w.findComponent({ name: 'SelectRoot' }).vm.$emit('update:modelValue', 'markAsRead')
      await nextTick()
      const applyBtn = w.findAll('button').find((b) => b.text() === 'Appliquer')
      expect(applyBtn!.element.disabled).toBe(true)
    })

    it('is disabled when selectedCount > 0 but no action is chosen', () => {
      const w = mountToolbar({ selectedCount: 1 })
      const applyBtn = w.findAll('button').find((b) => b.text() === 'Appliquer')
      expect(applyBtn!.element.disabled).toBe(true)
    })

    it('is enabled when an action is chosen and selectedCount > 0', async () => {
      const w = mountToolbar({ selectedCount: 1 })
      await w.findComponent({ name: 'SelectRoot' }).vm.$emit('update:modelValue', 'markAsRead')
      await nextTick()
      const applyBtn = w.findAll('button').find((b) => b.text() === 'Appliquer')
      expect(applyBtn!.element.disabled).toBe(false)
    })

    it('emits apply with the selected action when clicked', async () => {
      const w = mountToolbar({ selectedCount: 1 })
      await w.findComponent({ name: 'SelectRoot' }).vm.$emit('update:modelValue', 'markAsRead')
      await nextTick()
      await w.findAll('button').find((b) => b.text() === 'Appliquer')!.trigger('click')
      expect(w.emitted('apply')).toEqual([['markAsRead']])
    })

    it('resets the selected action after emitting apply', async () => {
      const w = mountToolbar({ selectedCount: 1 })
      await w.findComponent({ name: 'SelectRoot' }).vm.$emit('update:modelValue', 'delete')
      await nextTick()
      const applyBtn = w.findAll('button').find((b) => b.text() === 'Appliquer')!
      await applyBtn.trigger('click')
      await nextTick()
      expect(applyBtn.element.disabled).toBe(true)
    })
  })

  describe('count slot', () => {
    it('renders slot content when selectedCount > 0', () => {
      const w = mount(AppBulkActionsToolbar, {
        props: { allSelected: false, someSelected: false, selectedCount: 3, actions: ACTIONS, applyLabel: 'Appliquer' },
        slots: { count: '3 sélectionnée(s)' },
        global: { plugins: [createPinia(), i18n] },
      })
      expect(w.text()).toContain('3 sélectionnée(s)')
    })

    it('does not render slot content when selectedCount is 0', () => {
      const w = mount(AppBulkActionsToolbar, {
        props: { allSelected: false, someSelected: false, selectedCount: 0, actions: ACTIONS, applyLabel: 'Appliquer' },
        slots: { count: '0 sélectionnée(s)' },
        global: { plugins: [createPinia(), i18n] },
      })
      expect(w.text()).not.toContain('sélectionnée(s)')
    })
  })
})
