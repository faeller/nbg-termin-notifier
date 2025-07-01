import { createI18n } from 'vue-i18n'
import de from './de'
import en from './en'
import ru from './ru'
import fr from './fr'
import nl from './nl'

// Language translations
const messages = {
  de,
  en,
  ru,
  fr,
  nl
}

// Create i18n instance
export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en', // Default to English
  fallbackLocale: 'en',
  messages
})

// Helper function to change language
export function setLanguage(locale: string) {
  i18n.global.locale.value = locale as any
  localStorage.setItem('language', locale)
  // Update page title
  updatePageTitle()
}

// Update page title based on current language
export function updatePageTitle() {
  const t = i18n.global.t
  document.title = t('app.title')
}

// Export available locales
export const availableLocales = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'ru', name: 'Русский' }
]