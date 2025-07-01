import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'

import App from './App.vue'
import router from './router'
import { backgroundWorkerService } from './services/backgroundWorkerService'
import { i18n } from './i18n'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)
app.use(i18n)

app.mount('#app')

// Initialize background worker service
console.log('Background worker service initialized:', backgroundWorkerService)

// Expose for debugging in console
;(window as any).debugBackgroundWorker = {
  service: backgroundWorkerService,
  resetTimestamp: (subscriptionId: string) => backgroundWorkerService.resetLastNotifiedTimestamp(subscriptionId),
  fixTimestamps: () => backgroundWorkerService.fixTimestampFormats(),
  getSubscriptions: () => backgroundWorkerService.getSubscriptions(),
  checkNow: () => {
    const subscriptions = backgroundWorkerService.getSubscriptions()
    subscriptions.forEach(sub => {
      console.log(`Subscription ${sub.id}: lastNotified = ${sub.lastNotifiedTimestamp} (${new Date(sub.lastNotifiedTimestamp).toLocaleString()})`)
    })
  }
}
