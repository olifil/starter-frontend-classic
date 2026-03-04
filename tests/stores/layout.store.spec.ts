import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLayoutStore } from '@/interface/stores/layout.store'

describe('useLayoutStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has empty pageTitle', () => {
      const store = useLayoutStore()
      expect(store.pageTitle).toBe('')
    })

    it('has empty pageDescription', () => {
      const store = useLayoutStore()
      expect(store.pageDescription).toBe('')
    })
  })

  describe('resetPageMeta', () => {
    it('clears pageTitle and pageDescription', () => {
      const store = useLayoutStore()
      store.pageTitle = 'My Title'
      store.pageDescription = 'My Description'
      store.resetPageMeta()
      expect(store.pageTitle).toBe('')
      expect(store.pageDescription).toBe('')
    })

    it('does nothing when pageTitle and pageDescription are already empty', () => {
      const store = useLayoutStore()
      store.resetPageMeta()
      expect(store.pageTitle).toBe('')
      expect(store.pageDescription).toBe('')
    })
  })
})
