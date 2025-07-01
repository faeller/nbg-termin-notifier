import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { appointmentService, appointmentTypes, type AppointmentData, type AppointmentLocation } from '../services/appointmentService'
import { notificationService, NotificationPermission } from '../services/notificationService'
import { backgroundWorkerService, type SubscriptionConfig } from '../services/backgroundWorkerService'

export const useAppointmentStore = defineStore('appointments', () => {
  // Load selectedAppointmentTypes from localStorage
  const savedSelectedTypes = localStorage.getItem('selectedAppointmentTypes')
  const selectedAppointmentTypes = ref<number[]>(savedSelectedTypes ? JSON.parse(savedSelectedTypes) : [])
  
  const appointmentData = ref<Map<number, AppointmentData[]>>(new Map())
  const lastKnownTimestamps = ref<Map<number, number>>(new Map())
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const notificationPermission = ref<NotificationPermission>(notificationService.getPermissionStatus())
  const pollingInterval = ref<number | null>(null)
  const pollingFrequency = ref(15000) // 15 seconds
  
  // Load backgroundImage from localStorage
  const savedBackgroundImage = localStorage.getItem('backgroundImage')
  const backgroundImage = ref<string | null>(savedBackgroundImage)
  
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
    notificationPermission.value = await notificationService.requestPermission()
  }

  async function fetchAppointmentData(appointmentTypeId: number) {
    const appointmentType = appointmentTypes.find(type => type.id === appointmentTypeId)
    if (!appointmentType) {
      throw new Error(`Appointment type with id ${appointmentTypeId} not found`)
    }

    try {
      isLoading.value = true
      error.value = null
      
      const data = await appointmentService.fetchAppointmentDates(appointmentType)
      appointmentData.value.set(appointmentTypeId, data)
      
      // Update last known timestamp
      const latestTimestamp = getLatestTimestamp(data)
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

  async function checkForNewAppointments() {
    if (selectedAppointmentTypes.value.length === 0) return

    try {
      for (const appointmentTypeId of selectedAppointmentTypes.value) {
        const appointmentType = appointmentTypes.find(type => type.id === appointmentTypeId)
        if (!appointmentType) continue

        const lastTimestamp = lastKnownTimestamps.value.get(appointmentTypeId) || 0
        const newAppointments = await appointmentService.checkForNewAppointments(appointmentType, lastTimestamp)
        
        if (newAppointments.length > 0 && hasNotificationPermission.value) {
          for (const appointment of newAppointments) {
            await notificationService.showAppointmentNotification(appointment, appointmentType.name)
          }
        }

        // Update data and timestamp
        await fetchAppointmentData(appointmentTypeId)
      }
    } catch (err) {
      console.error('Error checking for new appointments:', err)
    }
  }

  function toggleAppointmentType(appointmentTypeId: number) {
    const index = selectedAppointmentTypes.value.indexOf(appointmentTypeId)
    if (index === -1) {
      selectedAppointmentTypes.value.push(appointmentTypeId)
      fetchAppointmentData(appointmentTypeId)
    } else {
      selectedAppointmentTypes.value.splice(index, 1)
      appointmentData.value.delete(appointmentTypeId)
      lastKnownTimestamps.value.delete(appointmentTypeId)
    }
    
    // Save to localStorage
    localStorage.setItem('selectedAppointmentTypes', JSON.stringify(selectedAppointmentTypes.value))
  }

  function startPolling() {
    if (pollingInterval.value) return
    
    pollingInterval.value = setInterval(() => {
      checkForNewAppointments()
    }, pollingFrequency.value)
  }

  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  function setPollingFrequency(frequency: number) {
    pollingFrequency.value = frequency
    if (pollingInterval.value) {
      stopPolling()
      startPolling()
    }
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

  // Initialize store - load data for previously selected appointment types
  function initializeStore() {
    selectedAppointmentTypes.value.forEach(appointmentTypeId => {
      fetchAppointmentData(appointmentTypeId)
    })
  }

  return {
    selectedAppointmentTypes,
    appointmentData,
    isLoading,
    error,
    notificationPermission,
    pollingFrequency,
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
    checkForNewAppointments,
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
    initializeStore
  }
})