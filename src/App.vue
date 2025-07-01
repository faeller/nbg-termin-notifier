<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { 
  NConfigProvider, NLayout, NLayoutContent, NPageHeader, NSpace, NButton, NIcon, 
  NSwitch, NModal, NCard, NAlert, NText, NInputNumber, NInput, NMessageProvider,
  NNotificationProvider, NGlobalStyle,
  darkTheme, type GlobalThemeOverrides 
} from 'naive-ui'
import { Settings } from '@vicons/tabler'
import { useAppointmentStore } from './stores/appointments'
import AnalyticsBanner from './components/AnalyticsBanner.vue'
const store = useAppointmentStore()

const isDark = ref(false)
const showSettings = ref(false)
const backgroundImageUrl = ref('')
const pollingMinutes = ref(0.5)

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
  if (!store.isNotificationSupported) return 'Nicht unterstützt'
  if (store.hasNotificationPermission) return 'Aktiviert'
  return 'Deaktiviert'
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
  store.setPollingFrequency(pollingMinutes.value * 60 * 1000)
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

onMounted(() => {
  // Load theme preference
  const savedTheme = localStorage.getItem('theme')
  isDark.value = savedTheme === 'dark'
  
  // Initialize polling frequency
  pollingMinutes.value = store.pollingFrequency / (60 * 1000)
  
  // Load background image from localStorage
  const savedBackgroundImage = localStorage.getItem('backgroundImage')
  if (savedBackgroundImage) {
    store.setBackgroundImage(savedBackgroundImage)
    backgroundImageUrl.value = savedBackgroundImage
  }
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
            <h1 class="app-title">Nürnberg Termin Notifier</h1>
            <n-space align="center" :size="12">
              <n-switch 
                v-model:value="isDark" 
                @update:value="toggleTheme"
                size="large"
              >
                <template #checked>🌙</template>
                <template #unchecked>☀️</template>
              </n-switch>
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
          <n-modal v-model:show="showSettings" preset="card" title="Einstellungen" style="width: 600px">
            <n-space vertical>
              <n-card title="Benachrichtigungen" size="small">
                <n-space vertical>
                  <n-alert v-if="!store.isNotificationSupported" type="warning">
                    Ihr Browser unterstützt keine Benachrichtigungen.
                  </n-alert>
                  <div v-else>
                    <n-text>Status: {{ notificationStatusText }}</n-text>
                    <n-button 
                      v-if="!store.hasNotificationPermission" 
                      @click="requestNotifications"
                      type="primary"
                      style="margin-left: 12px"
                    >
                      Benachrichtigungen aktivieren
                    </n-button>
                  </div>
                </n-space>
              </n-card>

              <n-card title="Polling-Frequenz" size="small">
                <n-space align="center">
                  <n-text>Alle</n-text>
                  <n-input-number 
                    v-model:value="pollingMinutes" 
                    :min="1" 
                    :max="60" 
                    @update:value="updatePollingFrequency"
                    style="width: 120px"
                  />
                  <n-text>Minuten prüfen</n-text>
                </n-space>
              </n-card>

              <n-card title="Hintergrundbild" size="small">
                <n-space vertical>
                  <n-input 
                    v-model:value="backgroundImageUrl" 
                    placeholder="URL zum Hintergrundbild eingeben"
                    @keyup.enter="setBackgroundImage"
                  />
                  <n-space>
                    <n-button @click="setBackgroundImage" type="primary">Setzen</n-button>
                    <n-button @click="clearBackgroundImage">Entfernen</n-button>
                  </n-space>
                </n-space>
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
