<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  NGrid, NGridItem, NCard, NSpace, NButton, NIcon, NText, NTime, NAlert,
  NSpin, NEmpty, NSwitch, NCollapse, NCollapseItem, NBadge, NH3
} from 'naive-ui'
import { Bell, BellOff, Clock, MapPin, ExternalLink } from '@vicons/tabler'
import { useAppointmentStore } from '../stores/appointments'
import { useMessage } from 'naive-ui'

const store = useAppointmentStore()
const message = useMessage()

const isPolling = ref(false)


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
    message.warning('Bitte wählen Sie mindestens einen Termintyp aus.')
    return
  }
  
  if (!store.hasNotificationPermission) {
    message.warning('Bitte aktivieren Sie Benachrichtigungen in den Einstellungen.')
    return
  }
  
  store.startPolling()
  isPolling.value = true
  message.success('Überwachung gestartet!')
}

function stopPolling() {
  store.stopPolling()
  isPolling.value = false
  message.info('Überwachung gestoppt!')
}

function openReservationLink(url: string) {
  window.open(url, '_blank')
}


onMounted(() => {
  // Initialize selected appointment types if needed
  if (store.selectedAppointmentTypes.length === 0) {
    // Add default appointment type (Wohnung anmelden)
    store.toggleAppointmentType(1)
  }
})

onUnmounted(() => {
  if (isPolling.value) {
    store.stopPolling()
  }
})
</script>

<template>
  <div>
    <!-- Header Section -->
    <n-space vertical size="large">
      <n-card title="Überwachung" size="medium">
        <n-space align="center" justify="space-between">
          <n-space align="center">
            <n-switch 
              v-model:value="isPolling" 
              @update:value="isPolling ? startPolling() : stopPolling()"
              :disabled="store.selectedAppointmentTypes.length === 0 || !store.hasNotificationPermission"
            >
              <template #checked>
                <n-icon><Bell /></n-icon>
              </template>
              <template #unchecked>
                <n-icon><BellOff /></n-icon>
              </template>
            </n-switch>
            <n-text>{{ isPolling ? 'Überwachung aktiv' : 'Überwachung gestoppt' }}</n-text>
          </n-space>
          
          <n-space align="center">
            <n-icon><Clock /></n-icon>
            <n-text>Alle {{ store.pollingFrequency / (60 * 1000) }} Minuten</n-text>
          </n-space>
        </n-space>
        
        <n-alert 
          v-if="!store.hasNotificationPermission" 
          type="warning" 
          style="margin-top: 16px"
        >
          Bitte aktivieren Sie Benachrichtigungen in den Einstellungen, um Alerts zu erhalten.
        </n-alert>
      </n-card>

      <!-- Appointment Types Grid -->
      <div>
        <n-h3 prefix="bar" style="margin-bottom: 16px">
          Verfügbare Termintypen
        </n-h3>
        
        <n-grid :cols="1" :x-gap="16" :y-gap="16" responsive="screen">
          <n-grid-item 
            v-for="appointmentType in store.availableAppointmentTypes" 
            :key="appointmentType.id"
          >
            <n-card 
              :title="appointmentType.name"
              :class="{ 'selected-appointment': store.selectedAppointmentTypes.includes(appointmentType.id) }"
              hoverable
            >
              <template #header-extra>
                <n-switch 
                  :value="store.selectedAppointmentTypes.includes(appointmentType.id)"
                  @update:value="() => toggleAppointmentType(appointmentType.id)"
                />
              </template>

              <n-space vertical>
                <!-- Loading State -->
                <div v-if="store.isLoading && store.selectedAppointmentTypes.includes(appointmentType.id)">
                  <n-spin size="small" />
                  <n-text style="margin-left: 8px">Lade Termine...</n-text>
                </div>

                <!-- Error State -->
                <n-alert 
                  v-else-if="store.error && store.selectedAppointmentTypes.includes(appointmentType.id)" 
                  type="error"
                >
                  {{ store.error }}
                </n-alert>

                <!-- Appointments List -->
                <div v-else-if="store.selectedAppointmentTypes.includes(appointmentType.id)">
                  <n-collapse>
                    <n-collapse-item 
                      title="Verfügbare Termine" 
                      :name="appointmentType.id"
                    >
                      <template #header-extra>
                        <n-badge 
                          :value="store.getAvailableAppointments(appointmentType.id).length"
                          :show="store.getAvailableAppointments(appointmentType.id).length > 0"
                          type="success"
                        />
                      </template>

                      <n-space vertical v-if="store.getAvailableAppointments(appointmentType.id).length > 0">
                        <n-card 
                          v-for="appointment in store.getAvailableAppointments(appointmentType.id)" 
                          :key="`${appointment.loc_id}-${appointment.timestamp}`"
                          size="small"
                          hoverable
                          @click="openReservationLink(appointment.reservation_link)"
                          style="cursor: pointer"
                        >
                          <n-space justify="space-between" align="center">
                            <n-space vertical size="small">
                              <n-space align="center">
                                <n-icon><MapPin /></n-icon>
                                <n-text strong>{{ appointment.place2 || appointment.place }}</n-text>
                              </n-space>
                              <n-space align="center">
                                <n-icon><Clock /></n-icon>
                                <n-time 
                                  v-if="appointment.timestamp" 
                                  :time="appointment.timestamp * 1000" 
                                  format="dd.MM.yyyy, HH:mm"
                                />
                              </n-space>
                            </n-space>
                            
                            <n-button type="primary" size="small" @click.stop="openReservationLink(appointment.reservation_link)">
                              <template #icon>
                                <n-icon><ExternalLink /></n-icon>
                              </template>
                              Buchen
                            </n-button>
                          </n-space>
                        </n-card>
                      </n-space>

                      <n-empty 
                        v-else
                        description="Keine Termine verfügbar"
                        size="small"
                      />
                    </n-collapse-item>
                  </n-collapse>
                </div>

                <!-- Instructions when not selected -->
                <n-text depth="3" v-else>
                  Aktivieren Sie diesen Termintyp, um verfügbare Termine zu sehen und Benachrichtigungen zu erhalten.
                </n-text>
              </n-space>
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>
    </n-space>
  </div>
</template>

<style scoped>
.selected-appointment {
  border: 2px solid var(--primary-color);
}

.n-card {
  transition: all 0.3s ease;
}

.n-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
