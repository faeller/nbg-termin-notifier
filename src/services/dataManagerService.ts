import { appointmentService, type AppointmentData, type AppointmentLocation, type AppointmentType } from './appointmentService'

export interface DataCache {
  appointmentTypeId: number
  data: AppointmentData[]
  timestamp: number
  lastApiCall: number
}

export interface DataChangeEvent {
  appointmentTypeId: number
  data: AppointmentData[]
  newAppointments: AppointmentLocation[]
  allAppointments: AppointmentLocation[]
}

type DataChangeListener = (event: DataChangeEvent) => void

class DataManagerService {
  private cache = new Map<number, DataCache>()
  private listeners = new Set<DataChangeListener>()
  private pollingInterval: number | null = null
  private checkInterval = 15000 // 15 seconds default
  private readonly cacheTimeout = 5000 // 5 seconds cache TTL
  private activeAppointmentTypes = new Set<number>()

  /**
   * Subscribe to data changes for all appointment types
   */
  onDataChange(listener: DataChangeListener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Start monitoring specific appointment types
   */
  addAppointmentType(appointmentTypeId: number) {
    this.activeAppointmentTypes.add(appointmentTypeId)
    
    // Fetch initial data immediately
    this.fetchAndCacheData(appointmentTypeId).catch(console.error)
    
    // Start polling if not already started
    this.startPolling()
  }

  /**
   * Stop monitoring specific appointment types
   */
  removeAppointmentType(appointmentTypeId: number) {
    this.activeAppointmentTypes.delete(appointmentTypeId)
    this.cache.delete(appointmentTypeId)
    
    // Stop polling if no active types
    if (this.activeAppointmentTypes.size === 0) {
      this.stopPolling()
    }
  }

  /**
   * Get cached data for appointment type (returns immediately)
   */
  getCachedData(appointmentTypeId: number): AppointmentData[] {
    const cached = this.cache.get(appointmentTypeId)
    return cached?.data || []
  }

  /**
   * Get cached appointments with availability info
   */
  getCachedAppointments(appointmentTypeId: number): AppointmentLocation[] {
    const data = this.getCachedData(appointmentTypeId)
    const appointments: AppointmentLocation[] = []
    
    data.forEach(appointmentData => {
      appointmentData.locations.forEach(location => {
        if (location.date && location.timestamp) {
          appointments.push(location)
        }
      })
    })
    
    return appointments.sort((a, b) => (a.timestamp as number) - (b.timestamp as number))
  }

  /**
   * Get fresh data (may use cache if recent enough)
   */
  async getFreshData(appointmentTypeId: number): Promise<AppointmentData[]> {
    const cached = this.cache.get(appointmentTypeId)
    const now = Date.now()
    
    // Return cached data if it's fresh enough
    if (cached && (now - cached.lastApiCall) < this.cacheTimeout) {
      return cached.data
    }
    
    return this.fetchAndCacheData(appointmentTypeId)
  }

  /**
   * Set polling frequency (affects all active monitoring)
   */
  setPollingFrequency(intervalMs: number) {
    this.checkInterval = intervalMs
    
    if (this.pollingInterval) {
      this.stopPolling()
      this.startPolling()
    }
  }

  /**
   * Get latest timestamp for an appointment type
   */
  getLatestTimestamp(appointmentTypeId: number): number {
    const appointments = this.getCachedAppointments(appointmentTypeId)
    return appointments.reduce((latest, apt) => 
      Math.max(latest, apt.timestamp as number), 0)
  }

  private async fetchAndCacheData(appointmentTypeId: number): Promise<AppointmentData[]> {
    const appointmentType = await this.getAppointmentTypeById(appointmentTypeId)
    if (!appointmentType) {
      throw new Error(`Appointment type ${appointmentTypeId} not found`)
    }

    console.log(`[DataManager] Fetching data for appointment type: ${appointmentType.name}`)
    
    const now = Date.now()
    const previousCache = this.cache.get(appointmentTypeId)
    const previousTimestamp = previousCache?.timestamp || 0
    
    try {
      const data = await appointmentService.fetchAppointmentDates(appointmentType)
      
      // Cache the data
      const newCache: DataCache = {
        appointmentTypeId,
        data,
        timestamp: this.getLatestTimestampFromData(data),
        lastApiCall: now
      }
      
      this.cache.set(appointmentTypeId, newCache)
      
      // Determine new appointments
      const allAppointments = this.extractAppointments(data)
      const newAppointments = allAppointments.filter(apt => 
        apt.timestamp && apt.timestamp > previousTimestamp)
      
      // Notify listeners of data change
      const event: DataChangeEvent = {
        appointmentTypeId,
        data,
        newAppointments,
        allAppointments
      }
      
      // Use setTimeout to batch multiple rapid updates
      setTimeout(() => {
        this.listeners.forEach(listener => {
          try {
            listener(event)
          } catch (error) {
            console.error('Error in data change listener:', error)
          }
        })
      }, 0)
      
      console.log(`[DataManager] Updated cache for ${appointmentType.name}. New appointments: ${newAppointments.length}`)
      
      return data
      
    } catch (error) {
      console.error(`[DataManager] Error fetching data for ${appointmentType.name}:`, error)
      throw error
    }
  }

  private startPolling() {
    if (this.pollingInterval || this.activeAppointmentTypes.size === 0) {
      return
    }
    
    console.log(`[DataManager] Starting polling every ${this.checkInterval}ms for ${this.activeAppointmentTypes.size} appointment types`)
    
    this.pollingInterval = setInterval(async () => {
      for (const appointmentTypeId of this.activeAppointmentTypes) {
        try {
          await this.fetchAndCacheData(appointmentTypeId)
        } catch (error) {
          console.error(`[DataManager] Error during polling for type ${appointmentTypeId}:`, error)
        }
      }
    }, this.checkInterval)
  }

  private stopPolling() {
    if (this.pollingInterval) {
      console.log('[DataManager] Stopping polling')
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  private extractAppointments(data: AppointmentData[]): AppointmentLocation[] {
    const appointments: AppointmentLocation[] = []
    data.forEach(appointmentData => {
      appointments.push(...appointmentData.locations)
    })
    return appointments
  }

  private getLatestTimestampFromData(data: AppointmentData[]): number {
    let latest = 0
    data.forEach(appointmentData => {
      appointmentData.locations.forEach(location => {
        if (location.timestamp && location.timestamp > latest) {
          latest = location.timestamp
        }
      })
    })
    return latest
  }

  private async getAppointmentTypeById(id: number): Promise<AppointmentType | undefined> {
    const { appointmentTypes } = await import('./appointmentService')
    return appointmentTypes.find(type => type.id === id)
  }

  /**
   * Check if currently polling
   */
  isPolling(): boolean {
    return this.pollingInterval !== null
  }

  /**
   * Get active appointment type IDs
   */
  getActiveAppointmentTypes(): number[] {
    return Array.from(this.activeAppointmentTypes)
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopPolling()
    this.cache.clear()
    this.listeners.clear()
    this.activeAppointmentTypes.clear()
  }
}

export const dataManagerService = new DataManagerService()