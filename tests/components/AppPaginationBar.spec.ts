import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import AppPaginationBar from '@/interface/components/AppPaginationBar.vue'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

function mountBar(props: Record<string, unknown> = {}) {
  return mount(AppPaginationBar, {
    props: {
      totalItems: 10,
      totalPages: 1,
      page: 1,
      pageSize: 10,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      ...props,
    },
    global: { plugins: [createPinia(), i18n] },
  })
}

describe('AppPaginationBar', () => {
  describe('pagination', () => {
    it('does not render pagination when totalPages is 1', () => {
      const w = mountBar({ totalPages: 1 })
      expect(w.find('[data-slot="pagination"]').exists()).toBe(false)
    })

    it('renders pagination when totalPages > 1', () => {
      const w = mountBar({ totalPages: 3, totalItems: 25 })
      expect(w.find('[data-slot="pagination"]').exists()).toBe(true)
    })

    it('emits update:page when the page changes', async () => {
      const w = mountBar({ totalPages: 3, totalItems: 25 })
      await w.findComponent({ name: 'PaginationRoot' }).vm.$emit('update:page', 2)
      expect(w.emitted('update:page')).toEqual([[2]])
    })
  })

  describe('page size selector', () => {
    it('renders a select trigger', () => {
      const w = mountBar()
      expect(w.find('[data-slot="select-trigger"]').exists()).toBe(true)
    })

    it('passes pageSize as the select model value', () => {
      const w = mountBar({ pageSize: 10 })
      expect(w.findComponent({ name: 'SelectRoot' }).props('modelValue')).toBe('10')
    })

    it('emits update:pageSize with a number when the select changes', async () => {
      const w = mountBar()
      await w.findComponent({ name: 'SelectRoot' }).vm.$emit('update:modelValue', '20')
      expect(w.emitted('update:pageSize')).toEqual([[20]])
    })
  })
})
