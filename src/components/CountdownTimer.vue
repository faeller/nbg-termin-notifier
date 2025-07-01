<template>
  <!-- Compact mode for inline display -->
  <template v-if="compact">
    <n-space align="center" size="small">
      <n-text depth="3" style="font-size: 10px;">
        {{ t('countdown.updating') }}: {{ formatTime(secondsLeft) }}
      </n-text>
      <div 
        style="
          width: 16px; 
          height: 16px; 
          border-radius: 50%; 
          background: #18a05820; 
          position: relative; 
          overflow: hidden;
          flex-shrink: 0;
          display: inline-block;
        "
      >
        <div 
          :style="{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `conic-gradient(#18a058 ${progressPercentage}%, transparent ${progressPercentage}%)`,
            transition: 'background 0.1s ease'
          }"
        />
      </div>
    </n-space>
  </template>
  
  <!-- Full mode -->
  <template v-else>
    <n-space align="center" size="small">
      <n-icon size="16" :color="isActive ? '#18a058' : '#909399'">
        <ClockIcon />
      </n-icon>
      <n-text :depth="isActive ? 1 : 3">
        {{ t('countdown.nextCheck') }}: 
        <n-text 
          :type="getTimeType()" 
          strong
          :style="{ 
            fontSize: '14px',
            transition: 'all 0.3s ease',
            transform: secondsLeft <= 3 ? 'scale(1.1)' : 'scale(1)'
          }"
        >
          {{ formatTime(secondsLeft) }}
        </n-text>
      </n-text>
      <n-progress
        type="circle"
        :percentage="progressPercentage"
        :size="24"
        :show-indicator="false"
        :stroke-width="8"
        :color="getProgressColor()"
        style="transition: all 0.3s ease"
      />
    </n-space>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NSpace, NIcon, NText, NProgress } from 'naive-ui'
import { Clock as ClockIcon } from '@vicons/tabler'

interface Props {
  intervalMs: number // Total interval in milliseconds
  isActive: boolean
  compact?: boolean // Compact mode for inline display
}

const props = defineProps<Props>()
const { t } = useI18n()

const secondsLeft = ref(0)
const timer = ref<number | null>(null)

const totalSeconds = computed(() => Math.floor(props.intervalMs / 1000))

const progressPercentage = computed(() => {
  if (totalSeconds.value === 0) return 0
  return ((totalSeconds.value - secondsLeft.value) / totalSeconds.value) * 100
})

function formatTime(seconds: number): string {
  if (seconds <= 0) return '0s'
  
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

function getTimeType() {
  if (!props.isActive) return 'default'
  if (secondsLeft.value <= 3) return 'error'
  if (secondsLeft.value <= 10) return 'warning'
  return 'success'
}

function getProgressColor(): string {
  if (!props.isActive) return '#909399'
  
  const percentage = progressPercentage.value
  if (percentage >= 90) return '#f5222d' // red
  if (percentage >= 70) return '#fa8c16' // orange
  if (percentage >= 40) return '#fadb14' // yellow
  return '#52c41a' // green
}

function getCompactProgressColor(): string {
  if (!props.isActive) return '#d9d9d9'
  
  const percentage = progressPercentage.value
  if (percentage >= 85) return '#18a058' // green when almost done
  return '#18a05860' // semi-transparent green
}

function startCountdown() {
  if (!props.isActive) return
  
  secondsLeft.value = totalSeconds.value
  
  if (timer.value) {
    clearInterval(timer.value)
  }
  
  timer.value = setInterval(() => {
    if (secondsLeft.value > 0) {
      secondsLeft.value--
    } else {
      // Reset countdown when it reaches 0
      secondsLeft.value = totalSeconds.value
    }
  }, 1000)
}

function stopCountdown() {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  secondsLeft.value = 0
}

// Restart countdown when props change
function restartCountdown() {
  if (props.isActive) {
    startCountdown()
  } else {
    stopCountdown()
  }
}

onMounted(() => {
  restartCountdown()
})

onUnmounted(() => {
  stopCountdown()
})

// Watch for prop changes
watch(() => props.isActive, () => {
  restartCountdown()
})

watch(() => props.intervalMs, () => {
  if (props.isActive) {
    startCountdown()
  }
})
</script>

<style scoped>
/* Pulse animation for when countdown is almost done */
.n-text[style*="scale(1.1)"] {
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    opacity: 0.8;
  }
  to {
    opacity: 1;
  }
}
</style>