<template>
  <n-modal
    v-model:show="show"
    preset="card"
    :style="{ maxWidth: '600px' }"
    title="🔔 Benachrichtigungs-Abonnement"
    size="large"
    :bordered="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
  >
    <n-form :model="filterForm" ref="formRef" label-placement="top">
      <n-form-item label="📍 Standorte auswählen" path="selectedLocations">
        <n-space vertical size="small">
          <n-space>
            <n-button size="small" @click="selectAllLocations">Alle auswählen</n-button>
            <n-button size="small" @click="clearAllLocations">Alle abwählen</n-button>
          </n-space>
          <n-checkbox-group v-model:value="filterForm.selectedLocations">
            <n-space vertical>
              <n-checkbox
                v-for="location in availableLocations"
                :key="location.locationId"
                :value="location.locationId"
                :label="location.name"
              />
            </n-space>
          </n-checkbox-group>
        </n-space>
      </n-form-item>

      <n-form-item label="📅 Wochentage auswählen" path="selectedDays">
        <n-space vertical size="small">
          <n-space>
            <n-button size="small" @click="selectAllDays">Alle auswählen</n-button>
            <n-button size="small" @click="clearAllDays">Alle abwählen</n-button>
          </n-space>
          <n-checkbox-group v-model:value="filterForm.selectedDays">
            <n-grid :cols="4" :x-gap="12">
              <n-gi v-for="(day, index) in weekDays" :key="index">
                <n-checkbox :value="index" :label="day" />
              </n-gi>
            </n-grid>
          </n-checkbox-group>
        </n-space>
      </n-form-item>

      <n-form-item label="⏰ Uhrzeiten" path="timeRanges">
        <n-dynamic-input
          v-model:value="filterForm.timeRanges"
          :on-create="createTimeRange"
          #="{ index, value }"
        >
          <n-space>
            <n-time-picker
              v-model:value="value.start"
              format="HH:mm"
              placeholder="Von"
              :hours="Array.from({ length: 24 }, (_, i) => i)"
              :minutes="Array.from({ length: 60 }, (_, i) => i)"
            />
            <span style="align-self: center">bis</span>
            <n-time-picker
              v-model:value="value.end"
              format="HH:mm"
              placeholder="Bis"
              :hours="Array.from({ length: 24 }, (_, i) => i)"
              :minutes="Array.from({ length: 60 }, (_, i) => i)"
            />
          </n-space>
        </n-dynamic-input>
        <template #feedback>
          <n-text depth="3" style="font-size: 12px;">
            Leer lassen für alle Uhrzeiten
          </n-text>
        </template>
      </n-form-item>

      <n-form-item>
        <n-space>
          <n-switch v-model:value="filterForm.enabled" size="large" />
          <n-text>Benachrichtigungen aktivieren</n-text>
        </n-space>
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="show = false">Abbrechen</n-button>
        <n-button
          type="primary"
          @click="saveFilters"
          :loading="saving"
        >
          Abonnement speichern
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NModal,
  NForm,
  NFormItem,
  NCheckboxGroup,
  NCheckbox,
  NSpace,
  NGrid,
  NGi,
  NDynamicInput,
  NTimePicker,
  NSwitch,
  NText,
  NButton,
  useMessage
} from 'naive-ui'
import type { FormInst } from 'naive-ui'
import { backgroundWorkerService, type FilterCriteria, type TimeRange } from '../services/backgroundWorkerService'
import { appointmentTypes, type AppointmentType } from '../services/appointmentService'

interface Props {
  appointmentTypeId: number
  existingSubscriptionId?: string
}

interface LocationOption {
  locationId: number
  name: string
}

interface TimeRangeForm {
  start: number | null
  end: number | null
}

interface FilterForm {
  selectedLocations: number[]
  selectedDays: number[]
  timeRanges: TimeRangeForm[]
  enabled: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  subscriptionCreated: [subscriptionId: string]
  subscriptionUpdated: [subscriptionId: string]
  close: []
}>()

const message = useMessage()
const show = defineModel<boolean>('show', { required: true })
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const weekDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

const filterForm = ref<FilterForm>({
  selectedLocations: [],
  selectedDays: [],
  timeRanges: [],
  enabled: true
})

const appointmentType = computed((): AppointmentType | undefined => {
  return appointmentTypes.find(type => type.id === props.appointmentTypeId)
})

const availableLocations = computed((): LocationOption[] => {
  if (!appointmentType.value) return []
  
  const locations: LocationOption[] = []
  appointmentType.value.locations.forEach(location => {
    location.locationIds.forEach(locationId => {
      locations.push({
        locationId,
        name: location.shortName
      })
    })
  })
  
  return locations
})

function createTimeRange(): TimeRangeForm {
  return { start: null, end: null }
}

function selectAllLocations() {
  filterForm.value.selectedLocations = availableLocations.value.map(loc => loc.locationId)
}

function clearAllLocations() {
  filterForm.value.selectedLocations = []
}

function selectAllDays() {
  filterForm.value.selectedDays = [0, 1, 2, 3, 4, 5, 6]
}

function clearAllDays() {
  filterForm.value.selectedDays = []
}

function timeToTimestamp(time: number | null): string {
  if (time === null) return ''
  const date = new Date(time)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function timestampToTime(timeStr: string): number {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.getTime()
}

async function saveFilters() {
  if (!appointmentType.value) return
  
  saving.value = true
  
  try {
    const timeRanges: TimeRange[] = filterForm.value.timeRanges
      .filter(range => range.start !== null && range.end !== null)
      .map(range => ({
        start: timeToTimestamp(range.start),
        end: timeToTimestamp(range.end)
      }))

    const filterCriteria: Omit<FilterCriteria, 'appointmentTypeId'> = {
      enabledDays: filterForm.value.selectedDays,
      allowedLocations: filterForm.value.selectedLocations,
      timeRanges,
      enabled: filterForm.value.enabled
    }

    if (props.existingSubscriptionId) {
      // Update existing subscription
      const success = backgroundWorkerService.updateSubscription(
        props.existingSubscriptionId,
        filterCriteria
      )
      
      if (success) {
        message.success('Filter erfolgreich aktualisiert!')
        emit('subscriptionUpdated', props.existingSubscriptionId)
      } else {
        message.error('Fehler beim Aktualisieren der Filter')
      }
    } else {
      // Always create new subscription (allow multiple subscriptions per appointment type)
      const subscriptionId = await backgroundWorkerService.subscribeToAppointments(
        props.appointmentTypeId,
        filterCriteria
      )
      
      message.success('Benachrichtigungs-Abonnement erfolgreich erstellt!')
      emit('subscriptionCreated', subscriptionId)
    }
    
    show.value = false
  } catch (error) {
    console.error('Error saving filters:', error)
    message.error('Fehler beim Speichern der Filter')
  } finally {
    saving.value = false
  }
}

// Load existing subscription data if editing
watch(() => props.existingSubscriptionId, (subscriptionId) => {
  if (subscriptionId) {
    const subscription = backgroundWorkerService.getSubscription(subscriptionId)
    if (subscription) {
      filterForm.value = {
        selectedLocations: subscription.filters.allowedLocations,
        selectedDays: subscription.filters.enabledDays,
        timeRanges: subscription.filters.timeRanges.map(range => ({
          start: timestampToTime(range.start),
          end: timestampToTime(range.end)
        })),
        enabled: subscription.filters.enabled
      }
    }
  } else {
    // Check if there's an existing subscription for this appointment type
    const existingSubscriptions = backgroundWorkerService.getSubscriptions()
      .filter(sub => sub.appointmentTypeId === props.appointmentTypeId)
    
    if (existingSubscriptions.length > 0) {
      const subscription = existingSubscriptions[0]
      filterForm.value = {
        selectedLocations: subscription.filters.allowedLocations,
        selectedDays: subscription.filters.enabledDays,
        timeRanges: subscription.filters.timeRanges.map(range => ({
          start: timestampToTime(range.start),
          end: timestampToTime(range.end)
        })),
        enabled: subscription.filters.enabled
      }
    }
  }
}, { immediate: true })

// Reset form when modal closes
watch(show, (isVisible) => {
  if (!isVisible && !props.existingSubscriptionId) {
    filterForm.value = {
      selectedLocations: [],
      selectedDays: [],
      timeRanges: [],
      enabled: true
    }
  }
})
</script>