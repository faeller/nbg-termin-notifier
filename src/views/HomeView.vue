<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NGrid, NGridItem, NCard, NSpace, NButton, NIcon, NText, NTime, NAlert,
  NSpin, NEmpty, NSwitch, NCollapse, NCollapseItem, NH3, NBadge, NDivider, NModal
} from 'naive-ui'
import { Bell, BellOff, Clock, MapPin, ExternalLink, Filter, Settings, Plus } from '@vicons/tabler'
import { useAppointmentStore } from '../stores/appointments'
import { useMessage } from 'naive-ui'
import FilterModal from '../components/FilterModal.vue'
import SubscriptionManager from '../components/SubscriptionManager.vue'
import CountdownTimer from '../components/CountdownTimer.vue'

const store = useAppointmentStore()
const message = useMessage()
const { t } = useI18n()

// Use store's polling state instead of local ref
const isPolling = computed(() => store.isPollingActive)

// Map appointment type names to translation keys
const appointmentTypeNames: Record<string, string> = {
  'Wohnung anmelden oder ummelden': 'appointmentTypes.registration',
  'Personalausweis beantragen': 'appointmentTypes.personalId',
  'Vorläufigen Personalausweis beantragen': 'appointmentTypes.tempPersonalId',
  'Reisepass beantragen': 'appointmentTypes.passport',
  'Neues Fahrzeug anmelden': 'appointmentTypes.vehicleRegistration',
  'Geschlechtseintrag ändern': 'appointmentTypes.genderChange'
}

function getTranslatedAppointmentName(name: string): string {
  const key = appointmentTypeNames[name]
  return key ? t(key) : name
}



function toggleAppointmentType(appointmentTypeId: number) {
  store.toggleAppointmentType(appointmentTypeId)

  if (store.selectedAppointmentTypes.includes(appointmentTypeId)) {
    message.success('Termintyp hinzugefügt!')
    if (!isPolling.value && store.hasNotificationPermission) {
      startPolling()
    }
  } else {
    message.info('Termintyp entfernt!')
    if (store.selectedAppointmentTypes.length === 0) {
      stopPolling()
    }
  }
}

function startPolling() {
  if (store.selectedAppointmentTypes.length === 0) {
    message.warning(t('monitoring.selectAppointmentType'))
    return
  }

  if (!store.hasNotificationPermission) {
    message.warning(t('monitoring.enableNotifications'))
    return
  }

  store.startPolling()
  message.success(t('monitoring.started'))
}

function stopPolling() {
  store.stopPolling()
  message.info(t('monitoring.stoppedMsg'))
}

function openReservationLink(url: string) {
  window.open(url, '_blank')
}

function openFilterModal(appointmentTypeId: number) {
  // Always open modal for creating new subscription (allow multiple)
  store.openFilterModal(appointmentTypeId)
}

function onSubscriptionCreated() {
  store.refreshSubscriptions()
  message.success('Filter-Überwachung erfolgreich aktiviert!')
}

function onSubscriptionUpdated() {
  store.refreshSubscriptions()
  message.success('Filter erfolgreich aktualisiert!')
}

const showSubscriptionManager = ref(false)

// Sort appointment types: enabled ones first, then disabled ones
const sortedAppointmentTypes = computed(() => {
  return store.availableAppointmentTypes.slice().sort((a, b) => {
    const aSelected = store.selectedAppointmentTypes.includes(a.id)
    const bSelected = store.selectedAppointmentTypes.includes(b.id)

    // If one is selected and the other isn't, prioritize the selected one
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1

    // If both have the same selection status, sort by ID (original order)
    return a.id - b.id
  })
})


onMounted(() => {
  // Initialize store - load data for previously selected appointment types
  store.initializeStore()

  // Only add default appointment type if this is the first time using the app
  if (store.selectedAppointmentTypes.length === 0 && !localStorage.getItem('selectedAppointmentTypes')) {
    // Add default appointment type (Wohnung anmelden) for first-time users
    store.toggleAppointmentType(1)
  }


  // Load existing subscriptions
  store.refreshSubscriptions()

  // Refresh subscriptions when modal closes to update counters
  watch(showSubscriptionManager, (isOpen, wasOpen) => {
    // Only refresh when modal was open and is now closing
    if (wasOpen && !isOpen) {
      store.refreshSubscriptions()
    }
  })
})

onUnmounted(() => {
  if (isPolling.value) {
    store.stopPolling()
  }
})
</script>

<template>
  <div class="main-container">
    <!-- Header Section -->
    <n-space vertical size="medium">
      <n-card :title="t('monitoring.title')" size="medium">
        <n-space align="center" justify="space-between">
          <n-space align="center">
            <n-switch :value="isPolling" @update:value="(value) => value ? startPolling() : stopPolling()"
              :disabled="store.selectedAppointmentTypes.length === 0 || !store.hasNotificationPermission">
              <template #checked>
                <n-icon>
                  <Bell />
                </n-icon>
              </template>
              <template #unchecked>
                <n-icon>
                  <BellOff />
                </n-icon>
              </template>
            </n-switch>
            <n-text>{{ isPolling ? t('monitoring.active') : t('monitoring.stopped') }}</n-text>
          </n-space>

          <n-space align="center" size="small">
            <n-icon size="14">
              <Clock />
            </n-icon>
            <n-text depth="2">{{ t('monitoring.frequency', { seconds: store.pollingFrequency / 1000 }) }}</n-text>
            <CountdownTimer :interval-ms="store.pollingFrequency" :is-active="isPolling" compact />
          </n-space>
        </n-space>

        <n-alert v-if="!store.hasNotificationPermission" type="warning" style="margin-top: 16px">
          <n-space vertical size="small" class="notification-alert">
            <n-text>{{ t('monitoring.enableNotifications') }}</n-text>
            <n-button size="small" type="primary" @click="store.requestNotificationPermission()"
              class="notification-button">
              {{ t('monitoring.enableNotificationsBtn') }}
            </n-button>
          </n-space>
        </n-alert>
      </n-card>

      <!-- Appointment Types Grid -->
      <div>
        <n-h3 prefix="bar" style="margin: 24px 0 20px 0">
          {{ t('appointments.title') }}
        </n-h3>

        <n-grid :cols="1" :x-gap="16" :y-gap="16" responsive="screen">
          <n-grid-item v-for="appointmentType in sortedAppointmentTypes" :key="appointmentType.id">
            <n-card :class="{ 'selected-appointment': store.selectedAppointmentTypes.includes(appointmentType.id) }"
              hoverable>
              <template #header>
                <div class="appointment-header">
                  <h3 class="appointment-title">{{ getTranslatedAppointmentName(appointmentType.name) }}</h3>
                  <div class="appointment-actions">
                    <n-space>
                      <n-button size="small" :type="store.hasActiveFilters(appointmentType.id) ? 'success' : 'default'"
                        ghost @click.stop="openFilterModal(appointmentType.id)">
                        <template #icon>
                          <n-icon size="14">
                            <Bell />
                          </n-icon>
                        </template><span>+</span>
                      </n-button>

                      <!-- Edit subscriptions button (only show if subscriptions exist) -->
                      <n-button v-if="store.activeSubscriptions.length > 0" size="small"
                        :type="showSubscriptionManager ? 'primary' : 'default'" ghost
                        @click.stop="showSubscriptionManager = !showSubscriptionManager">
                        <template #icon>
                          <n-icon size="14">
                            <Settings />
                          </n-icon>
                        </template>
                        <n-badge
                          :value="store.getSubscriptionsForAppointmentType(appointmentType.id).filter(s => s.filters.enabled).length"
                          :show="store.getSubscriptionsForAppointmentType(appointmentType.id).filter(s => s.filters.enabled).length > 0"
                          type="success" :size="12" style="margin-left: 4px;" />
                      </n-button>

                      <n-switch :value="store.selectedAppointmentTypes.includes(appointmentType.id)"
                        @update:value="() => toggleAppointmentType(appointmentType.id)" />
                    </n-space>
                  </div>
                </div>
              </template>

              <n-space vertical>
                <!-- Loading State -->
                <div v-if="store.isLoading && store.selectedAppointmentTypes.includes(appointmentType.id)">
                  <n-spin size="small" />
                  <n-text style="margin-left: 8px">{{ t('appointments.loading') }}</n-text>
                </div>

                <!-- Error State -->
                <n-alert v-else-if="store.error && store.selectedAppointmentTypes.includes(appointmentType.id)"
                  type="error">
                  {{ store.error }}
                </n-alert>

                <!-- Appointments List -->
                <div v-else-if="store.selectedAppointmentTypes.includes(appointmentType.id)">
                  <n-collapse :default-expanded-names="[appointmentType.id]">
                    <n-collapse-item :title="t('appointments.title')" :name="appointmentType.id" style="padding: 8px 0;">
                      <template #header-extra>
                        <n-badge :value="store.getAvailableAppointments(appointmentType.id).length"
                          :show="store.getAvailableAppointments(appointmentType.id).length > 0" type="success" />
                      </template>

                      <n-space vertical v-if="store.getAvailableAppointments(appointmentType.id).length > 0">
                        <n-card v-for="appointment in store.getAvailableAppointments(appointmentType.id)"
                          :key="`${appointment.loc_id}-${appointment.timestamp}`" size="small" hoverable
                          @click="openReservationLink(appointment.reservation_link)" style="cursor: pointer">
                          <n-space justify="space-between" align="center">
                            <n-space vertical size="small">
                              <n-space align="center">
                                <n-icon>
                                  <MapPin />
                                </n-icon>
                                <n-text strong>{{ appointment.place2 || appointment.place }}</n-text>
                              </n-space>
                              <n-space align="center">
                                <n-icon>
                                  <Clock />
                                </n-icon>
                                <n-time v-if="appointment.timestamp" :time="appointment.timestamp * 1000"
                                  format="dd.MM.yyyy, HH:mm" />
                              </n-space>
                            </n-space>

                            <n-button type="primary" size="small"
                              @click.stop="openReservationLink(appointment.reservation_link)">
                              <template #icon>
                                <n-icon>
                                  <ExternalLink />
                                </n-icon>
                              </template>
                              {{ t('appointments.makeReservation') }}
                            </n-button>
                          </n-space>
                        </n-card>
                      </n-space>

                      <n-empty v-else :description="t('appointments.noData')" size="small" />
                    </n-collapse-item>
                  </n-collapse>
                </div>

                <!-- Instructions when not selected -->
                <n-text depth="3" v-else>
                  {{ t('appointments.enableInstructions') }}
                </n-text>
              </n-space>
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>

    </n-space>

    <!-- Filter Modal -->
    <FilterModal v-model:show="store.showFilterModal" :appointment-type-id="store.filterModalAppointmentType"
      :existing-subscription-id="store.filterModalExistingSubscriptionId" @subscription-created="onSubscriptionCreated"
      @subscription-updated="onSubscriptionUpdated" @close="store.closeFilterModal" />

    <!-- Subscription Manager Modal -->
    <n-modal v-model:show="showSubscriptionManager" preset="card" :style="{ maxWidth: '800px', width: '90vw' }"
      :title="t('subscriptions.title')" size="large" :bordered="false"
      :segmented="{ content: 'soft', footer: 'soft' }">
      <SubscriptionManager />
    </n-modal>
  </div>
</template>

<style scoped>
.main-container {
  /* Max-width handled by App.vue */
}

.selected-appointment {
  border: 2px solid var(--primary-color);
}

/* Mobile responsive notification alert */
@media (max-width: 600px) {
  .notification-alert {
    align-items: stretch;
  }

  .notification-button {
    width: 100%;
    align-self: stretch;
  }
}

/* Responsive appointment card header */
.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.appointment-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
  hyphens: auto;
  flex: 1;
  min-width: 0;
  /* Allow flex shrinking */
}

.appointment-actions {
  flex-shrink: 0;
}

/* Stack title above buttons on small screens */
@media (max-width: 480px) {
  .appointment-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .appointment-title {
    font-size: 16px;
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .appointment-actions {
    align-self: flex-end;
  }
}

/* Fix notification text wrapping */
.notification-alert :deep(.n-text) {
  word-break: break-word;
  hyphens: auto;
  line-height: 1.4;
}

@media (max-width: 480px) {
  .notification-alert :deep(.n-text) {
    font-size: 14px;
    line-height: 1.3;
  }
}

:deep(.n-collapse-item) {
  border: none !important;
}

:deep(.n-collapse-item .n-collapse-item__header) {
  border: none !important;
  background: transparent !important;
  padding: 12px 16px !important;
}


@media (min-width: 768px) {
  .n-grid {
    --n-cols: 1;
  }
}

@media (min-width: 1200px) {
  .n-grid {
    --n-cols: 1;
  }
}
</style>
