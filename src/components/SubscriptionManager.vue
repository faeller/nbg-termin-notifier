<template>
  <n-card title="🔔 Aktive Filter-Überwachungen" size="small" :bordered="false">
    <template v-if="subscriptions.length === 0">
      <n-empty description="Keine aktiven Filter-Überwachungen">
        <template #icon>
          <n-icon size="48" color="#909399">
            <BellOffIcon />
          </n-icon>
        </template>
        <template #extra>
          <n-text depth="3">
            Verwenden Sie die Filter-Buttons bei den Termintypen, um benachrichtigt zu werden.
          </n-text>
        </template>
      </n-empty>
    </template>

    <template v-else>
      <n-space vertical size="medium">
        <n-card
          v-for="subscription in subscriptions"
          :key="subscription.id"
          size="small"
          :bordered="false"
          embedded
        >
          <template #header>
            <n-space align="center" justify="space-between">
              <n-space align="center">
                <n-badge
                  :color="subscription.filters.enabled ? '#18a058' : '#909399'"
                  dot
                />
                <n-text strong>{{ getAppointmentTypeName(subscription.appointmentTypeId) }}</n-text>
              </n-space>
              <n-space>
                <n-switch
                  v-model:value="subscription.filters.enabled"
                  size="small"
                  @update:value="(value) => toggleSubscription(subscription.id, value)"
                />
              </n-space>
            </n-space>
          </template>

          <n-space vertical size="small">
            <!-- Location filters -->
            <n-space v-if="subscription.filters.allowedLocations.length > 0" align="center">
              <n-icon size="16" color="#909399">
                <MapPinIcon />
              </n-icon>
              <n-text depth="2">Standorte:</n-text>
              <n-space>
                <n-tag
                  v-for="locationId in subscription.filters.allowedLocations"
                  :key="locationId"
                  size="small"
                  type="info"
                >
                  {{ getLocationName(subscription.appointmentTypeId, locationId) }}
                </n-tag>
              </n-space>
            </n-space>

            <!-- Day filters -->
            <n-space v-if="subscription.filters.enabledDays.length > 0" align="center">
              <n-icon size="16" color="#909399">
                <CalendarIcon />
              </n-icon>
              <n-text depth="2">Wochentage:</n-text>
              <n-space>
                <n-tag
                  v-for="dayIndex in subscription.filters.enabledDays"
                  :key="dayIndex"
                  size="small"
                  type="success"
                >
                  {{ weekDays[dayIndex] }}
                </n-tag>
              </n-space>
            </n-space>

            <!-- Time filters -->
            <n-space v-if="subscription.filters.timeRanges.length > 0" align="center">
              <n-icon size="16" color="#909399">
                <ClockIcon />
              </n-icon>
              <n-text depth="2">Uhrzeiten:</n-text>
              <n-space>
                <n-tag
                  v-for="(timeRange, index) in subscription.filters.timeRanges"
                  :key="index"
                  size="small"
                  type="warning"
                >
                  {{ timeRange.start }} - {{ timeRange.end }}
                </n-tag>
              </n-space>
            </n-space>

            <!-- Subscription info -->
            <n-space align="center">
              <n-icon size="14" color="#909399">
                <InfoIcon />
              </n-icon>
              <n-text depth="3" style="font-size: 12px;">
                Erstellt: {{ formatDate(subscription.subscriptionTime) }}
              </n-text>
            </n-space>
          </n-space>

          <template #action>
            <n-space justify="end">
              <n-button
                size="small"
                @click="editSubscription(subscription)"
                ghost
              >
                <template #icon>
                  <n-icon><EditIcon /></n-icon>
                </template>
                Bearbeiten
              </n-button>
              <n-popconfirm
                @positive-click="removeSubscription(subscription.id)"
              >
                <template #trigger>
                  <n-button
                    size="small"
                    type="error"
                    ghost
                  >
                    <template #icon>
                      <n-icon><TrashIcon /></n-icon>
                    </template>
                    Löschen
                  </n-button>
                </template>
                Möchten Sie diese Filter-Überwachung wirklich löschen?
              </n-popconfirm>
            </n-space>
          </template>
        </n-card>
      </n-space>
    </template>

    <!-- Filter Modal -->
    <FilterModal
      v-model:show="showFilterModal"
      :appointment-type-id="editingAppointmentTypeId"
      :existing-subscription-id="editingSubscriptionId"
      @subscription-updated="refreshSubscriptions"
      @close="closeFilterModal"
    />
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  NCard,
  NSpace,
  NText,
  NIcon,
  NBadge,
  NSwitch,
  NTag,
  NButton,
  NPopconfirm,
  NEmpty,
  useMessage
} from 'naive-ui'
import {
  Bell as BellOffIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  InfoCircle as InfoIcon,
  Edit as EditIcon,
  Trash as TrashIcon
} from '@vicons/tabler'
import { backgroundWorkerService, type SubscriptionConfig } from '../services/backgroundWorkerService'
import { appointmentTypes } from '../services/appointmentService'
import FilterModal from './FilterModal.vue'

const message = useMessage()
const subscriptions = ref<SubscriptionConfig[]>([])
const showFilterModal = ref(false)
const editingSubscriptionId = ref<string>('')
const editingAppointmentTypeId = ref<number>(0)

const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

function refreshSubscriptions() {
  subscriptions.value = backgroundWorkerService.getSubscriptions()
}

function getAppointmentTypeName(appointmentTypeId: number): string {
  const appointmentType = appointmentTypes.find(type => type.id === appointmentTypeId)
  return appointmentType?.name || `Unbekannter Typ (${appointmentTypeId})`
}

function getLocationName(appointmentTypeId: number, locationId: number): string {
  const appointmentType = appointmentTypes.find(type => type.id === appointmentTypeId)
  if (!appointmentType) return `Location ${locationId}`

  for (const location of appointmentType.locations) {
    if (location.locationIds.includes(locationId)) {
      return location.shortName
    }
  }
  
  return `Location ${locationId}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function toggleSubscription(subscriptionId: string, enabled: boolean) {
  const success = backgroundWorkerService.updateSubscription(subscriptionId, { enabled })
  if (success) {
    message.success(enabled ? 'Filter-Überwachung aktiviert' : 'Filter-Überwachung deaktiviert')
    refreshSubscriptions()
  } else {
    message.error('Fehler beim Aktualisieren der Überwachung')
  }
}

function editSubscription(subscription: SubscriptionConfig) {
  editingSubscriptionId.value = subscription.id
  editingAppointmentTypeId.value = subscription.appointmentTypeId
  showFilterModal.value = true
}

function removeSubscription(subscriptionId: string) {
  const success = backgroundWorkerService.unsubscribe(subscriptionId)
  if (success) {
    message.success('Filter-Überwachung erfolgreich gelöscht')
    refreshSubscriptions()
  } else {
    message.error('Fehler beim Löschen der Überwachung')
  }
}

function closeFilterModal() {
  showFilterModal.value = false
  editingSubscriptionId.value = ''
  editingAppointmentTypeId.value = 0
}

onMounted(() => {
  refreshSubscriptions()
})
</script>