import { createI18n } from 'vue-i18n'
import fr from './locales/fr.yaml'
import en from './locales/en.yaml'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'en',
  messages: { fr, en },
})

export default i18n
