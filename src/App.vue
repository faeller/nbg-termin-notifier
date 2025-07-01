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
      backgroundAttachment: 'fixed'
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
          <n-page-header title="Nürnberg Termin Notifier" subtitle="Benachrichtigungen für verfügbare Termine">
            <template #extra>
              <n-space>
                <n-switch v-model:value="isDark" @update:value="toggleTheme">
                  <template #checked>🌙</template>
                  <template #unchecked>☀️</template>
                </n-switch>
                <n-button @click="showSettings = true" quaternary circle>
                  <template #icon>
                    <n-icon><Settings /></n-icon>
                  </template>
                </n-button>
              </n-space>
            </template>
          </n-page-header>
          
          <n-layout style="min-height: calc(100vh - 120px)">
            <n-layout-content :native-scrollbar="false" style="padding: 24px">
              <RouterView />
            </n-layout-content>
          </n-layout>

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

.app-container.has-background :deep(.n-card),
.app-container.has-background :deep(.n-modal),
.app-container.has-background :deep(.n-page-header) {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
}

.app-container.has-background.dark-theme :deep(.n-card),
.app-container.has-background.dark-theme :deep(.n-modal),
.app-container.has-background.dark-theme :deep(.n-page-header) {
  background-color: rgba(16, 16, 20, 0.9) !important;
  backdrop-filter: blur(10px);
}
</style>
