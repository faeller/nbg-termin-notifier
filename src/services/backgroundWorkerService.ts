import { notificationService } from './notificationService'
import { appointmentService, type AppointmentLocation, type AppointmentType } from './appointmentService'
import { dataManagerService, type DataChangeEvent } from './dataManagerService'

export interface TimeRange {
  start: string // HH:mm format
  end: string   // HH:mm format
}

export interface FilterCriteria {
  appointmentTypeId: number
  enabledDays: number[] // 0=Sunday, 1=Monday, etc.
  allowedLocations: number[] // location IDs
  timeRanges: TimeRange[] // allowed time ranges
  enabled: boolean
}

export interface SubscriptionConfig {
  id: string
  appointmentTypeId: number
  filters: FilterCriteria
  lastNotifiedTimestamp: number
  subscriptionTime: number
}

class BackgroundWorkerService {
  private subscriptions = new Map<string, SubscriptionConfig>()
  private workerInterval: number | null = null
  private checkInterval = 15000 // Default: 15 seconds for background checks
  private readonly storageKey = 'nbg-appointment-subscriptions'
  private dataChangeUnsubscribe: (() => void) | null = null

  constructor() {
    this.loadSubscriptions()
    this.fixTimestampFormats() // Fix any existing timestamp format issues
    this.subscribeToDataChanges()
  }

  generateSubscriptionId(): string {
    return crypto.randomUUID()
  }

  async subscribeToAppointments(
    appointmentTypeId: number,
    filters: Omit<FilterCriteria, 'appointmentTypeId'>
  ): Promise<string> {
    const subscriptionId = this.generateSubscriptionId()
    
    const subscription: SubscriptionConfig = {
      id: subscriptionId,
      appointmentTypeId,
      filters: {
        appointmentTypeId,
        ...filters
      },
      lastNotifiedTimestamp: 0, // Start with 0 to allow all current appointments to be considered "new"
      subscriptionTime: Date.now()
    }

    this.subscriptions.set(subscriptionId, subscription)
    this.saveSubscriptions()

    // Send immediate subscription confirmation notification
    await this.sendSubscriptionNotification(subscription)

    return subscriptionId
  }

  unsubscribe(subscriptionId: string): boolean {
    const deleted = this.subscriptions.delete(subscriptionId)
    if (deleted) {
      this.saveSubscriptions()
    }
    return deleted
  }

  getSubscriptions(): SubscriptionConfig[] {
    return Array.from(this.subscriptions.values())
  }

  getSubscription(subscriptionId: string): SubscriptionConfig | undefined {
    return this.subscriptions.get(subscriptionId)
  }

  // For debugging: reset last notified timestamp to allow all appointments to be considered "new"
  resetLastNotifiedTimestamp(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) return false

    console.log(`Resetting lastNotifiedTimestamp for subscription ${subscriptionId} from ${subscription.lastNotifiedTimestamp} to 0`)
    subscription.lastNotifiedTimestamp = 0
    this.saveSubscriptions()
    return true
  }

  // Fix timestamp format issues for existing subscriptions
  fixTimestampFormats(): void {
    console.log('Checking and fixing timestamp formats...')
    let fixedCount = 0
    
    for (const subscription of this.subscriptions.values()) {
      // If timestamp is in milliseconds (> 1e12), it's likely incorrect for appointment timestamps
      if (subscription.lastNotifiedTimestamp > 1e12) {
        console.log(`Fixing subscription ${subscription.id}: timestamp ${subscription.lastNotifiedTimestamp} appears to be in milliseconds, resetting to 0`)
        subscription.lastNotifiedTimestamp = 0
        fixedCount++
      }
    }
    
    if (fixedCount > 0) {
      this.saveSubscriptions()
      console.log(`Fixed ${fixedCount} subscription(s) with incorrect timestamp format`)
    } else {
      console.log('No timestamp format issues found')
    }
  }

  updateSubscription(subscriptionId: string, updates: Partial<FilterCriteria>): boolean {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) return false

    subscription.filters = { ...subscription.filters, ...updates }
    this.saveSubscriptions()
    return true
  }

  private async sendSubscriptionNotification(subscription: SubscriptionConfig) {
    const appointmentType = await this.getAppointmentTypeById(subscription.appointmentTypeId)
    if (!appointmentType) return

    try {
      await notificationService.showSubscriptionNotification(appointmentType.name)
    } catch (error) {
      console.warn('Could not send subscription notification:', error)
    }
  }

  private subscribeToDataChanges() {
    this.dataChangeUnsubscribe = dataManagerService.onDataChange(this.handleDataChange.bind(this))
  }

  private handleDataChange(event: DataChangeEvent) {
    // Check if we have any subscriptions for this appointment type
    const relevantSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.appointmentTypeId === event.appointmentTypeId && sub.filters.enabled)
    
    if (relevantSubscriptions.length === 0) {
      return
    }

    console.log(`[BackgroundWorker] Processing data change for appointment type ${event.appointmentTypeId}`)
    console.log(`[BackgroundWorker] Found ${event.newAppointments.length} new appointments, ${relevantSubscriptions.length} relevant subscriptions`)

    // Process each subscription
    relevantSubscriptions.forEach(subscription => {
      this.processSubscriptionForNewAppointments(subscription, event.newAppointments)
    })
  }

  private async processSubscriptionForNewAppointments(subscription: SubscriptionConfig, newAppointments: AppointmentLocation[]) {
    console.log(`[BackgroundWorker] Processing subscription ${subscription.id}`)
    console.log(`[BackgroundWorker] Subscription last notified: ${subscription.lastNotifiedTimestamp}`)
    
    // Filter appointments that are newer than our last notification
    const appointmentsToProcess = newAppointments.filter(apt => 
      apt.timestamp && apt.timestamp > subscription.lastNotifiedTimestamp)
    
    console.log(`[BackgroundWorker] Found ${appointmentsToProcess.length} appointments newer than last notification`)
    
    if (appointmentsToProcess.length === 0) {
      return
    }

    // Apply subscription filters
    const filteredAppointments = this.applyFilters(appointmentsToProcess, subscription.filters)
    console.log(`[BackgroundWorker] After filtering: ${filteredAppointments.length} appointments match subscription filters`)

    if (filteredAppointments.length > 0) {
      const appointmentType = await this.getAppointmentTypeById(subscription.appointmentTypeId)
      if (!appointmentType) return

      // Send notifications
      for (const appointment of filteredAppointments) {
        await this.sendFilteredAppointmentNotification(appointment, appointmentType, subscription)
      }

      // Update last notified timestamp
      const latestTimestamp = Math.max(...filteredAppointments.map(a => a.timestamp as number))
      subscription.lastNotifiedTimestamp = latestTimestamp
      this.saveSubscriptions()
      
      console.log(`[BackgroundWorker] Updated subscription ${subscription.id} last notified timestamp to ${latestTimestamp}`)
    }
  }

  private startBackgroundWorker() {
    // Background worker is now event-driven, no polling needed
    console.log('[BackgroundWorker] Background worker started (event-driven mode)')
  }

  private stopBackgroundWorker() {
    console.log('[BackgroundWorker] Background worker stopped')
  }


  private applyFilters(appointments: AppointmentLocation[], filters: FilterCriteria): AppointmentLocation[] {
    console.log(`Applying filters to ${appointments.length} appointments`)
    
    return appointments.filter((appointment, index) => {
      console.log(`\n--- Filtering appointment ${index + 1}: ${appointment.place} ---`)
      console.log(`Location ID: ${appointment.loc_id}, Date: ${appointment.date}, Timestamp: ${appointment.timestamp}`)
      
      // Check location filter
      if (filters.allowedLocations.length > 0) {
        const locationMatch = filters.allowedLocations.includes(appointment.loc_id)
        console.log(`Location filter: ${filters.allowedLocations.length} allowed locations: ${filters.allowedLocations.join(', ')}`)
        console.log(`Appointment location ${appointment.loc_id} matches: ${locationMatch}`)
        if (!locationMatch) {
          console.log(`❌ FILTERED OUT: Location ${appointment.loc_id} not in allowed locations`)
          return false
        }
      } else {
        console.log(`✅ Location filter: No location restrictions (all locations allowed)`)
      }

      // Check day filter
      if (filters.enabledDays.length > 0 && appointment.date && appointment.timestamp) {
        const appointmentDate = new Date(appointment.timestamp * 1000)
        const dayOfWeek = appointmentDate.getDay()
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        console.log(`Day filter: ${filters.enabledDays.length} enabled days: ${filters.enabledDays.map(d => dayNames[d]).join(', ')}`)
        console.log(`Appointment day: ${dayNames[dayOfWeek]} (${dayOfWeek})`)
        
        const dayMatch = filters.enabledDays.includes(dayOfWeek)
        console.log(`Day matches: ${dayMatch}`)
        
        if (!dayMatch) {
          console.log(`❌ FILTERED OUT: Day ${dayNames[dayOfWeek]} not in enabled days`)
          return false
        }
      } else {
        console.log(`✅ Day filter: No day restrictions (all days allowed)`)
      }

      // Check time range filter
      if (filters.timeRanges.length > 0 && appointment.date && appointment.timestamp) {
        const appointmentDate = new Date(appointment.timestamp * 1000)
        const appointmentTime = `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`
        
        console.log(`Time filter: ${filters.timeRanges.length} time ranges: ${filters.timeRanges.map(r => `${r.start}-${r.end}`).join(', ')}`)
        console.log(`Appointment time: ${appointmentTime}`)
        
        const isInTimeRange = filters.timeRanges.some(range => {
          const inRange = appointmentTime >= range.start && appointmentTime <= range.end
          console.log(`  Range ${range.start}-${range.end}: ${inRange}`)
          return inRange
        })
        
        console.log(`Time matches any range: ${isInTimeRange}`)
        
        if (!isInTimeRange) {
          console.log(`❌ FILTERED OUT: Time ${appointmentTime} not in any allowed time range`)
          return false
        }
      } else {
        console.log(`✅ Time filter: No time restrictions (all times allowed)`)
      }

      console.log(`✅ PASSED ALL FILTERS: Appointment will trigger notification`)
      return true
    })
  }

  private async sendFilteredAppointmentNotification(
    appointment: AppointmentLocation,
    appointmentType: AppointmentType,
    subscription: SubscriptionConfig
  ) {
    const filterDescription = this.buildFilterDescription(subscription.filters)
    
    console.log(`Attempting to send notification for ${appointmentType.name} at ${appointment.place}`)
    
    try {
      // Check if notifications are supported and permitted
      if (!notificationService.isSupported()) {
        console.warn('Notifications not supported in this browser')
        return
      }

      const permission = notificationService.getPermissionStatus()
      console.log(`Notification permission status: ${permission}`)
      
      if (permission !== 'granted') {
        console.warn('Notification permission not granted, requesting permission...')
        const newPermission = await notificationService.requestPermission()
        console.log(`New permission status: ${newPermission}`)
        
        if (newPermission !== 'granted') {
          console.warn('Notification permission denied, cannot send notification')
          return
        }
      }

      await notificationService.showFilteredAppointmentNotification(
        appointment,
        appointmentType.name,
        filterDescription
      )
      
      console.log(`Successfully sent notification for ${appointmentType.name}`)
    } catch (error) {
      console.error('Error sending filtered appointment notification:', error)
    }
  }

  private buildFilterDescription(filters: FilterCriteria): string {
    const parts: string[] = []
    
    if (filters.enabledDays.length > 0 && filters.enabledDays.length < 7) {
      const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
      parts.push(`Tage: ${filters.enabledDays.map(d => dayNames[d]).join(', ')}`)
    }
    
    if (filters.timeRanges.length > 0) {
      const timeRangesStr = filters.timeRanges.map(r => `${r.start}-${r.end}`).join(', ')
      parts.push(`Zeiten: ${timeRangesStr}`)
    }
    
    if (filters.allowedLocations.length > 0) {
      parts.push(`${filters.allowedLocations.length} Standort(e)`)
    }
    
    return parts.join(' | ')
  }

  private async getAppointmentTypeById(id: number): Promise<AppointmentType | undefined> {
    const { appointmentTypes } = await import('./appointmentService')
    return appointmentTypes.find(type => type.id === id)
  }

  private saveSubscriptions() {
    try {
      const subscriptionsArray = Array.from(this.subscriptions.values())
      localStorage.setItem(this.storageKey, JSON.stringify(subscriptionsArray))
    } catch (error) {
      console.error('Failed to save subscriptions:', error)
    }
  }

  private loadSubscriptions() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const subscriptionsArray: SubscriptionConfig[] = JSON.parse(stored)
        subscriptionsArray.forEach(sub => {
          this.subscriptions.set(sub.id, sub)
        })
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error)
    }
  }

  setCheckInterval(intervalMs: number) {
    this.checkInterval = intervalMs
    // No longer needed as we're event-driven, but keeping for compatibility
    console.log(`[BackgroundWorker] Check interval set to ${intervalMs}ms (event-driven mode)`)
  }

  startWorker() {
    this.startBackgroundWorker()
  }

  stopWorker() {
    this.stopBackgroundWorker()
  }

  isRunning(): boolean {
    return this.workerInterval !== null
  }

  destroy() {
    this.stopBackgroundWorker()
    if (this.dataChangeUnsubscribe) {
      this.dataChangeUnsubscribe()
      this.dataChangeUnsubscribe = null
    }
    this.subscriptions.clear()
  }
}

export const backgroundWorkerService = new BackgroundWorkerService()