export const useLayoutStore = defineStore('layout', () => {
  const pageTitle = ref('')
  const pageDescription = ref('')

  const resetPageMeta = () => {
    pageTitle.value = ''
    pageDescription.value = ''
  }

  return {
    pageTitle,
    pageDescription,
    resetPageMeta,
  }
})
