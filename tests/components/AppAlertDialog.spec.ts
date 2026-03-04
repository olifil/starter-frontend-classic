import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import i18n from '@/i18n'
import AppAlertDialog from '@/interface/components/AppAlertDialog.vue'

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(AppAlertDialog, {
    props: {
      isOpen: false,
      title: 'Supprimer la notification',
      description: 'Cette action est irréversible.',
      confirmButtonText: 'Supprimer',
      ...props,
    },
    global: { plugins: [i18n] },
  })
}

async function openDialog(wrapper: ReturnType<typeof mountDialog>) {
  await wrapper.setProps({ isOpen: true })
  await nextTick()
}

describe('AppAlertDialog', () => {
  describe('open state', () => {
    it('passes open=false to AlertDialogRoot by default', () => {
      const wrapper = mountDialog()
      expect(wrapper.findComponent({ name: 'AlertDialogRoot' }).props('open')).toBe(false)
    })

    it('passes open=true to AlertDialogRoot when isOpen becomes true', async () => {
      const wrapper = mountDialog()
      await openDialog(wrapper)
      expect(wrapper.findComponent({ name: 'AlertDialogRoot' }).props('open')).toBe(true)
    })
  })

  describe('content rendering', () => {
    it('renders the title', async () => {
      const wrapper = mountDialog()
      await openDialog(wrapper)
      expect(wrapper.findComponent({ name: 'AlertDialogTitle' }).text()).toContain(
        'Supprimer la notification',
      )
    })

    it('renders the description', async () => {
      const wrapper = mountDialog()
      await openDialog(wrapper)
      expect(wrapper.findComponent({ name: 'AlertDialogDescription' }).text()).toContain(
        'Cette action est irréversible.',
      )
    })

    it('renders confirmButtonText in the action button', async () => {
      const wrapper = mountDialog()
      await openDialog(wrapper)
      expect(wrapper.findComponent({ name: 'AlertDialogAction' }).text()).toContain('Supprimer')
    })
  })

  describe('events', () => {
    it('emits confirm when the action button is clicked', async () => {
      const wrapper = mountDialog()
      await openDialog(wrapper)
      await wrapper.findComponent({ name: 'AlertDialogAction' }).trigger('click')
      expect(wrapper.emitted('confirm')).toHaveLength(1)
    })

    it('emits update:isOpen with false when the cancel button is clicked', async () => {
      const wrapper = mountDialog()
      await openDialog(wrapper)
      await wrapper.findComponent({ name: 'AlertDialogCancel' }).trigger('click')
      expect(wrapper.emitted('update:isOpen')?.[0]).toEqual([false])
    })
  })
})
