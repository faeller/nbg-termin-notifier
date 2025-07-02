<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView } from 'vue-router'
import { 
  NConfigProvider, NLayout, NLayoutContent, NPageHeader, NSpace, NButton, NIcon, 
  NSwitch, NModal, NCard, NAlert, NText, NInputNumber, NInput, NMessageProvider,
  NNotificationProvider, NGlobalStyle, NSelect,
  darkTheme, type GlobalThemeOverrides 
} from 'naive-ui'
import { Settings } from '@vicons/tabler'
import { useAppointmentStore } from './stores/appointments'
import AnalyticsBanner from './components/AnalyticsBanner.vue'
import posthog from 'posthog-js'
import { setLanguage, availableLocales } from './i18n'

const store = useAppointmentStore()
const { t, locale } = useI18n()

const isDark = ref(false)
const showSettings = ref(false)
const backgroundImageUrl = ref('')
const pollingSeconds = ref(15)
const analyticsEnabled = ref(false)

const theme = computed(() => isDark.value ? darkTheme : null)
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#18a058'
  }
}

const backgroundStyle = computed(() => {
  if (store.backgroundImage) {
    return {
      backgroundImage: `url(${store.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }
  }
  return {}
})

const notificationStatusText = computed(() => {
  if (!store.isNotificationSupported) return t('settings.notifications.notSupported')
  if (store.hasNotificationPermission) return t('settings.notifications.enabled')
  return t('settings.notifications.disabled')
})

function toggleTheme() {
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

async function requestNotifications() {
  try {
    await store.requestNotificationPermission()
  } catch (error) {
    console.error('Error requesting notifications:', error)
  }
}

function updatePollingFrequency() {
  // Enforce minimum of 5 seconds
  const minSeconds = 5
  if (pollingSeconds.value < minSeconds) {
    pollingSeconds.value = minSeconds
  }
  store.setPollingFrequency(pollingSeconds.value * 1000)
}

function setBackgroundImage() {
  if (backgroundImageUrl.value.trim()) {
    store.setBackgroundImage(backgroundImageUrl.value.trim())
  }
}

function clearBackgroundImage() {
  store.setBackgroundImage(null)
  backgroundImageUrl.value = ''
}

function toggleAnalytics() {
  if (analyticsEnabled.value) {
    localStorage.setItem('analytics-consent', 'accepted')
    posthog.opt_in_capturing()
    posthog.capture('analytics_consent_given')
  } else {
    localStorage.setItem('analytics-consent', 'declined')
    posthog.opt_out_capturing()
  }
}

function handleStorageChange(e: StorageEvent) {
  if (e.key === 'analytics-consent') {
    const analyticsConsent = localStorage.getItem('analytics-consent')
    analyticsEnabled.value = analyticsConsent === 'accepted'
  }
}

function changeLanguage(newLocale: string) {
  setLanguage(newLocale)
}

onMounted(() => {
  // Load theme preference
  const savedTheme = localStorage.getItem('theme')
  isDark.value = savedTheme === 'dark'
  
  // Initialize polling frequency
  pollingSeconds.value = store.pollingFrequency / 1000
  
  // Load background image from localStorage
  const savedBackgroundImage = localStorage.getItem('backgroundImage')
  if (savedBackgroundImage) {
    store.setBackgroundImage(savedBackgroundImage)
    backgroundImageUrl.value = savedBackgroundImage
  }
  
  // Load analytics consent preference
  const analyticsConsent = localStorage.getItem('analytics-consent')
  analyticsEnabled.value = analyticsConsent === 'accepted'
  
  // Listen for storage changes to sync banner and settings
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-message-provider>
      <n-notification-provider>
        <div 
          class="app-container" 
          :class="{ 
            'has-background': store.backgroundImage,
            'dark-theme': isDark 
          }"
          :style="backgroundStyle"
        >
          <div class="custom-header">
            <h1 class="app-title">{{ t('app.title') }}</h1>
            <n-space align="center" :size="12">
              <n-switch 
                v-model:value="isDark" 
                @update:value="toggleTheme"
                size="large"
              >
                <template #checked>🌙</template>
                <template #unchecked>☀️</template>
              </n-switch>
              <n-select
                :value="locale"
                @update:value="changeLanguage"
                :options="availableLocales.map(loc => ({ label: loc.name, value: loc.code }))"
                size="large"
                style="width: 120px"
                :placeholder="t('settings.language.title')"
              />
              <n-button 
                @click="showSettings = true" 
                quaternary 
                circle
                size="large"
              >
                <template #icon>
                  <n-icon><Settings /></n-icon>
                </template>
              </n-button>
            </n-space>
          </div>
          
          <div class="main-content">
            <RouterView />
          </div>

          <!-- Settings Modal -->
          <n-modal v-model:show="showSettings" preset="card" :title="t('settings.title')" style="width: 600px">
            <n-space vertical>
              <n-card :title="t('settings.notifications.title')" size="small">
                <n-space vertical>
                  <n-alert v-if="!store.isNotificationSupported" type="warning">
                    {{ t('settings.notifications.notSupported') }}
                  </n-alert>
                  <div v-else>
                    <n-text>{{ t('settings.notifications.status') }}: {{ notificationStatusText }}</n-text>
                    <n-button 
                      v-if="!store.hasNotificationPermission" 
                      @click="requestNotifications"
                      type="primary"
                      style="margin-left: 12px"
                    >
                      {{ t('settings.notifications.enable') }}
                    </n-button>
                  </div>
                </n-space>
              </n-card>

              <n-card :title="t('settings.polling.title')" size="small">
                <n-space align="center">
                  <n-text>{{ t('settings.polling.label') }}</n-text>
                  <n-input-number 
                    v-model:value="pollingSeconds" 
                    :min="5" 
                    :max="300" 
                    @update:value="updatePollingFrequency"
                    style="width: 120px"
                  />
                  <n-text>{{ t('settings.polling.unit') }}</n-text>
                </n-space>
              </n-card>

              <n-card :title="t('settings.background.title')" size="small">
                <n-space vertical>
                  <n-input 
                    v-model:value="backgroundImageUrl" 
                    :placeholder="t('settings.background.placeholder')"
                    @keyup.enter="setBackgroundImage"
                  />
                  <n-space>
                    <n-button @click="setBackgroundImage" type="primary">{{ t('settings.background.set') }}</n-button>
                    <n-button @click="clearBackgroundImage">{{ t('settings.background.remove') }}</n-button>
                  </n-space>
                </n-space>
              </n-card>

              <n-card :title="t('settings.analytics.title')" size="small">
                <n-space vertical>
                  <n-space align="center">
                    <n-switch 
                      v-model:value="analyticsEnabled" 
                      @update:value="toggleAnalytics"
                    />
                    <n-text>{{ t('settings.analytics.enable') }}</n-text>
                  </n-space>
                  <n-text depth="3" style="font-size: 12px;">
                    {{ t('settings.analytics.description') }}
                  </n-text>
                </n-space>
              </n-card>

              <n-card :title="t('settings.language.title')" size="small">
                <n-select
                  :value="locale"
                  @update:value="changeLanguage"
                  :options="availableLocales.map(loc => ({ label: loc.name, value: loc.code }))"
                  style="width: 200px"
                />
              </n-card>
            </n-space>
          </n-modal>
        </div>
        
        <!-- Analytics Consent Banner (outside app container for proper positioning) -->
        <AnalyticsBanner />
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  transition: background-image 0.3s ease;
  position: relative;
}

.app-container.has-background.dark-theme::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  pointer-events: none;
  z-index: 1;
}

.app-container > * {
  position: relative;
  z-index: 2;
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 0;
  min-height: 64px;
}


.app-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color-1);
  line-height: 1.2;
}

.main-content {
  padding: 24px;
}

.app-container.has-background {
  padding-top: 16px;
}

.app-container.has-background .custom-header {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(8px);
  border-radius: 12px 12px 0 0;
  margin: 0 auto 0px auto;
  max-width: 900px;
}

.app-container.has-background.dark-theme .custom-header {
  background-color: rgba(16, 16, 20, 0.8) !important;
}

.app-container.has-background .main-content {
  background-color: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(8px);
  border-radius: 0 0 12px 12px;
  margin: 0 auto 16px auto;
  max-width: 900px;
  padding: 32px;
}

.app-container.has-background.dark-theme .main-content {
  background-color: rgba(16, 16, 20, 0.4) !important;
  backdrop-filter: blur(8px);
}

.app-container.has-background :deep(.n-card),
.app-container.has-background :deep(.n-modal),
.app-container.has-background :deep(.n-alert),
.app-container.has-background :deep(.n-collapse-item) {
  background-color: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(8px);
}

.app-container.has-background.dark-theme :deep(.n-card),
.app-container.has-background.dark-theme :deep(.n-modal),
.app-container.has-background.dark-theme :deep(.n-alert),
.app-container.has-background.dark-theme :deep(.n-collapse-item) {
  background-color: rgba(16, 16, 20, 0.6) !important;
  backdrop-filter: blur(8px);
}
</style>
