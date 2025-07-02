import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { appointmentTypes, type AppointmentData, type AppointmentLocation } from '../services/appointmentService'
import { notificationService, NotificationPermission } from '../services/notificationService'
import { backgroundWorkerService, type SubscriptionConfig } from '../services/backgroundWorkerService'
import { dataManagerService, type DataChangeEvent } from '../services/dataManagerService'
import posthog from 'posthog-js'

// Helper function to check if analytics tracking is allowed
function canTrack(): boolean {
  const consent = localStorage.getItem('analytics-consent')
  // Allow tracking if user accepted OR if they haven't made a choice yet
  return consent === 'accepted' || consent === null
}

export const useAppointmentStore = defineStore('appointments', () => {
  // Load selectedAppointmentTypes from localStorage
  const savedSelectedTypes = localStorage.getItem('selectedAppointmentTypes')
  const selectedAppointmentTypes = ref<number[]>(savedSelectedTypes ? JSON.parse(savedSelectedTypes) : [])
  
  const appointmentData = ref<Map<number, AppointmentData[]>>(new Map())
  const lastKnownTimestamps = ref<Map<number, number>>(new Map())
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const notificationPermission = ref<NotificationPermission>(notificationService.getPermissionStatus())
  // Load polling state from localStorage with default fallback
  const savedPollingState = localStorage.getItem('isPollingActive')
  const isPollingActive = ref(savedPollingState === 'true')
  // Load polling frequency from localStorage with default fallback
  const savedPollingFrequency = localStorage.getItem('pollingFrequency')
  const pollingFrequency = ref(savedPollingFrequency ? parseInt(savedPollingFrequency) : 15000) // 15 seconds default
  
  // Load backgroundImage from localStorage with default fallback
  const savedBackgroundImage = localStorage.getItem('backgroundImage')
  const defaultBackgroundImage = 'https://images.unsplash.com/photo-1590651639672-5f0178aa4812?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  const backgroundImage = ref<string | null>(savedBackgroundImage || defaultBackgroundImage)
  
  const activeSubscriptions = ref<SubscriptionConfig[]>([])
  const showFilterModal = ref(false)
  const filterModalAppointmentType = ref<number>(0)
  const filterModalExistingSubscriptionId = ref<string>('')

  const availableAppointmentTypes = computed(() => appointmentTypes)
  
  const hasNotificationPermission = computed(() => 
    notificationPermission.value === NotificationPermission.GRANTED
  )

  const isNotificationSupported = computed(() => notificationService.isSupported())

  async function requestNotificationPermission() {
    const previousPermission = notificationPermission.value
    notificationPermission.value = await notificationService.requestPermission()
    
    // Track notification permission request
    if (canTrack()) {
      posthog.capture('notification_permission_requested', {
        previous_permission: previousPermission,
        new_permission: notificationPermission.value,
        granted: notificationPermission.value === NotificationPermission.GRANTED
      })
    }
  }

  async function fetchAppointmentData(appointmentTypeId: number) {
    const appointmentType = appointmentTypes.find(type => type.id === appointmentTypeId)
    if (!appointmentType) {
      throw new Error(`Appointment type with id ${appointmentTypeId} not found`)
    }

    try {
      isLoading.value = true
      error.value = null
      
      const data = await dataManagerService.getFreshData(appointmentTypeId)
      appointmentData.value.set(appointmentTypeId, data)
      
      // Update last known timestamp
      const latestTimestamp = dataManagerService.getLatestTimestamp(appointmentTypeId)
      if (latestTimestamp > 0) {
        lastKnownTimestamps.value.set(appointmentTypeId, latestTimestamp)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Handle data updates from the central data manager
  function handleDataChange(event: DataChangeEvent) {
    // Update local cache
    appointmentData.value.set(event.appointmentTypeId, event.data)
    
    // Update timestamp
    const latestTimestamp = dataManagerService.getLatestTimestamp(event.appointmentTypeId)
    lastKnownTimestamps.value.set(event.appointmentTypeId, latestTimestamp)
    
    // Handle notifications for new appointments
    if (event.newAppointments.length > 0 && hasNotificationPermission.value) {
      const appointmentType = appointmentTypes.find(type => type.id === event.appointmentTypeId)
      if (appointmentType) {
        event.newAppointments.forEach(async (appointment) => {
          try {
            await notificationService.showAppointmentNotification(appointment, appointmentType.name)
          } catch (error) {
            console.error('Error showing notification:', error)
          }
        })
      }
    }
  }

  function toggleAppointmentType(appointmentTypeId: number) {
    const appointmentType = appointmentTypes.find(type => type.id === appointmentTypeId)
    const index = selectedAppointmentTypes.value.indexOf(appointmentTypeId)
    
    if (index === -1) {
      selectedAppointmentTypes.value.push(appointmentTypeId)
      
      // Add to data manager for monitoring
      dataManagerService.addAppointmentType(appointmentTypeId)
      
      // Get initial cached data if available
      const cachedData = dataManagerService.getCachedData(appointmentTypeId)
      if (cachedData.length > 0) {
        appointmentData.value.set(appointmentTypeId, cachedData)
        const latestTimestamp = dataManagerService.getLatestTimestamp(appointmentTypeId)
        lastKnownTimestamps.value.set(appointmentTypeId, latestTimestamp)
      }
      
      // Track appointment type enabled
      if (canTrack()) {
        posthog.capture('appointment_type_enabled', {
          appointment_type: appointmentType?.name,
          appointment_type_id: appointmentTypeId
        })
      }
    } else {
      selectedAppointmentTypes.value.splice(index, 1)
      
      // Remove from data manager
      dataManagerService.removeAppointmentType(appointmentTypeId)
      
      // Clear local data
      appointmentData.value.delete(appointmentTypeId)
      lastKnownTimestamps.value.delete(appointmentTypeId)
      
      // Track appointment type disabled
      if (canTrack()) {
        posthog.capture('appointment_type_disabled', {
          appointment_type: appointmentType?.name,
          appointment_type_id: appointmentTypeId
        })
      }
    }
    
    // Save to localStorage
    localStorage.setItem('selectedAppointmentTypes', JSON.stringify(selectedAppointmentTypes.value))
  }

  function startPolling() {
    // Data manager handles polling automatically when appointment types are active
    // Just start background worker for notifications
    backgroundWorkerService.startWorker()
    // Save polling state
    isPollingActive.value = true
    localStorage.setItem('isPollingActive', 'true')
  }

  function stopPolling() {
    // Stop background worker
    backgroundWorkerService.stopWorker()
    // Save polling state
    isPollingActive.value = false
    localStorage.setItem('isPollingActive', 'false')
  }

  function setPollingFrequency(frequency: number) {
    pollingFrequency.value = frequency
    // Save to localStorage
    localStorage.setItem('pollingFrequency', frequency.toString())
    // Update data manager and background worker intervals
    dataManagerService.setPollingFrequency(frequency)
    backgroundWorkerService.setCheckInterval(frequency)
  }

  function setBackgroundImage(imageUrl: string | null) {
    backgroundImage.value = imageUrl
    if (imageUrl) {
      localStorage.setItem('backgroundImage', imageUrl)
    } else {
      localStorage.removeItem('backgroundImage')
    }
  }

  function getLatestTimestamp(data: AppointmentData[]): number {
    let latest = 0
    data.forEach(appointment => {
      appointment.locations.forEach(location => {
        if (location.timestamp && location.timestamp > latest) {
          latest = location.timestamp
        }
      })
    })
    return latest
  }

  function getAppointmentData(appointmentTypeId: number): AppointmentData[] {
    return appointmentData.value.get(appointmentTypeId) || []
  }

  function getAvailableAppointments(appointmentTypeId: number): AppointmentLocation[] {
    const data = getAppointmentData(appointmentTypeId)
    const availableAppointments: AppointmentLocation[] = []
    
    data.forEach(appointment => {
      appointment.locations.forEach(location => {
        if (location.date && location.timestamp) {
          availableAppointments.push(location)
        }
      })
    })
    
    return availableAppointments.sort((a, b) => (a.timestamp as number) - (b.timestamp as number))
  }

  function refreshSubscriptions() {
    activeSubscriptions.value = backgroundWorkerService.getSubscriptions()
  }

  function openFilterModal(appointmentTypeId: number, existingSubscriptionId?: string) {
    filterModalAppointmentType.value = appointmentTypeId
    filterModalExistingSubscriptionId.value = existingSubscriptionId || ''
    showFilterModal.value = true
  }

  function closeFilterModal() {
    showFilterModal.value = false
    filterModalAppointmentType.value = 0
    filterModalExistingSubscriptionId.value = ''
  }

  function getSubscriptionsForAppointmentType(appointmentTypeId: number): SubscriptionConfig[] {
    return activeSubscriptions.value.filter(sub => sub.appointmentTypeId === appointmentTypeId)
  }

  function hasActiveFilters(appointmentTypeId: number): boolean {
    return getSubscriptionsForAppointmentType(appointmentTypeId).some(sub => sub.filters.enabled)
  }

  // Subscribe to data changes from the central data manager
  const unsubscribeDataChanges = dataManagerService.onDataChange(handleDataChange)

  // Initialize store - load data for previously selected appointment types
  function initializeStore() {
    // Synchronize services with current polling frequency
    dataManagerService.setPollingFrequency(pollingFrequency.value)
    backgroundWorkerService.setCheckInterval(pollingFrequency.value)
    
    // Add previously selected appointment types to data manager
    selectedAppointmentTypes.value.forEach(appointmentTypeId => {
      dataManagerService.addAppointmentType(appointmentTypeId)
      
      // Get any cached data immediately
      const cachedData = dataManagerService.getCachedData(appointmentTypeId)
      if (cachedData.length > 0) {
        appointmentData.value.set(appointmentTypeId, cachedData)
        const latestTimestamp = dataManagerService.getLatestTimestamp(appointmentTypeId)
        lastKnownTimestamps.value.set(appointmentTypeId, latestTimestamp)
      }
    })
    
    // Restore polling state if it was active
    if (isPollingActive.value && selectedAppointmentTypes.value.length > 0) {
      startPolling()
    }
  }

  // Cleanup function for when store is destroyed
  function destroyStore() {
    unsubscribeDataChanges()
  }

  return {
    selectedAppointmentTypes,
    appointmentData,
    isLoading,
    error,
    notificationPermission,
    pollingFrequency,
    isPollingActive,
    backgroundImage,
    activeSubscriptions,
    showFilterModal,
    filterModalAppointmentType,
    filterModalExistingSubscriptionId,
    availableAppointmentTypes,
    hasNotificationPermission,
    isNotificationSupported,
    requestNotificationPermission,
    fetchAppointmentData,
    toggleAppointmentType,
    startPolling,
    stopPolling,
    setPollingFrequency,
    setBackgroundImage,
    getAppointmentData,
    getAvailableAppointments,
    refreshSubscriptions,
    openFilterModal,
    closeFilterModal,
    getSubscriptionsForAppointmentType,
    hasActiveFilters,
    initializeStore,
    destroyStore
  }
})