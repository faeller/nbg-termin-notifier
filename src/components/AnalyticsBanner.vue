<template>
  <n-card 
    v-if="showBanner" 
    class="analytics-banner"
    size="small"
  >
    <n-space align="center" justify="space-between">
      <n-text>
        {{ t('analytics.message') }}
        <n-button text type="primary" @click="showDetails = !showDetails">
          {{ showDetails ? t('analytics.learnLess') : t('analytics.learnMore') }}
        </n-button>
      </n-text>
      <n-space>
        <n-button size="small" @click="declineAnalytics">
          {{ t('analytics.decline') }}
        </n-button>
        <n-button size="small" type="primary" @click="acceptAnalytics">
          {{ t('analytics.accept') }}
        </n-button>
      </n-space>
    </n-space>
    
    <n-collapse-transition :show="showDetails">
      <n-divider style="margin: 12px 0;" />
      <n-text depth="3" style="font-size: 12px;">
        {{ t('analytics.details') }}
        <n-button text type="primary" tag="a" href="https://posthog.com/privacy" target="_blank" style="font-size: 12px;">
          {{ t('analytics.privacyLink') }}
        </n-button>
      </n-text>
    </n-collapse-transition>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { NCard, NSpace, NText, NButton, NDivider, NCollapseTransition } from 'naive-ui'
import posthog from 'posthog-js'

const showBanner = ref(false)
const showDetails = ref(false)
const { t } = useI18n()

function checkConsent() {
  const analyticsConsent = localStorage.getItem('analytics-consent')
  if (!analyticsConsent) {
    showBanner.value = true
  } else {
    showBanner.value = false
    if (analyticsConsent === 'accepted') {
      posthog.opt_in_capturing()
    } else {
      posthog.opt_out_capturing()
    }
  }
}

function handleStorageChange(e: StorageEvent) {
  if (e.key === 'analytics-consent') {
    checkConsent()
  }
}

onMounted(() => {
  checkConsent()
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})

function acceptAnalytics() {
  localStorage.setItem('analytics-consent', 'accepted')
  showBanner.value = false
  // PostHog is already initialized, just ensure it's not opted out
  posthog.opt_in_capturing()
  posthog.capture('analytics_consent_given')
}

function declineAnalytics() {
  localStorage.setItem('analytics-consent', 'declined')
  showBanner.value = false
  // Opt out of PostHog tracking
  posthog.opt_out_capturing()
}
</script>

<style scoped>
.analytics-banner {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 480px) {
  .analytics-banner {
    bottom: 16px;
    left: 16px;
    right: 16px;
    width: auto;
  }
}
</style>