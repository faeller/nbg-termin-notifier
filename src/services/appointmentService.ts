export interface AppointmentLocation {
  i: number
  loc_id: number
  place: string
  place2: string
  used: string
  date: string | false
  timestamp: number | false
  reservation_link: string
}

export interface AppointmentData {
  cnc_id: number
  name: string
  noDates: boolean
  alternativeTitle: string | null
  locations: AppointmentLocation[]
}

export interface ApiResponse {
  success: number
  data: AppointmentData[]
}

export interface AppointmentType {
  id: number
  name: string
  concernIds: number[]
  locations: {
    shortName: string
    departmentName: string | null
    locationIds: number[]
  }[]
}

export const appointmentTypes: AppointmentType[] = [
  {
    id: 1,
    name: 'Wohnung anmelden oder ummelden',
    concernIds: [187],
    locations: [
      { shortName: 'Bürgeramt Mitte', departmentName: null, locationIds: [4] },
      { shortName: 'Bürgeramt Eberhardshof', departmentName: null, locationIds: [116] },
      { shortName: 'Bürgeramt Frankenstraße', departmentName: null, locationIds: [64] },
      { shortName: 'Bürgeramt Nord', departmentName: 'Einwohnermelde- und Passangelegenheiten, Führerscheine, Beglaubigungen', locationIds: [34] },
      { shortName: 'Bürgeramt Ost', departmentName: null, locationIds: [24] },
      { shortName: 'Bürgeramt Süd', departmentName: null, locationIds: [14] },
      { shortName: 'Bürgerdienste in den Sparkassen', departmentName: null, locationIds: [38, 37, 28, 39] }
    ]
  },
  {
    id: 2,
    name: 'Personalausweis beantragen',
    concernIds: [38],
    locations: [
      { shortName: 'Bürgeramt Mitte', departmentName: null, locationIds: [4] },
      { shortName: 'Bürgeramt Eberhardshof', departmentName: null, locationIds: [116] },
      { shortName: 'Bürgeramt Frankenstraße', departmentName: null, locationIds: [64] },
      { shortName: 'Bürgeramt Nord', departmentName: 'Einwohnermelde- und Passangelegenheiten, Führerscheine, Beglaubigungen', locationIds: [34] },
      { shortName: 'Bürgeramt Ost', departmentName: null, locationIds: [24] },
      { shortName: 'Bürgeramt Süd', departmentName: null, locationIds: [14] },
      { shortName: 'Bürgerdienste in den Sparkassen', departmentName: null, locationIds: [38, 37, 28, 39] }
    ]
  },
  {
    id: 3,
    name: 'Vorläufigen Personalausweis beantragen',
    concernIds: [51],
    locations: [
      { shortName: 'Bürgeramt Mitte', departmentName: null, locationIds: [45] },
      { shortName: 'Bürgeramt Frankenstraße', departmentName: null, locationIds: [64] },
      { shortName: 'Bürgeramt Nord', departmentName: 'Einwohnermelde- und Passangelegenheiten, Führerscheine, Beglaubigungen', locationIds: [34] },
      { shortName: 'Bürgeramt Ost', departmentName: null, locationIds: [24] },
      { shortName: 'Bürgeramt Süd', departmentName: null, locationIds: [14] }
    ]
  },
  {
    id: 4,
    name: 'Reisepass beantragen',
    concernIds: [40],
    locations: [
      { shortName: 'Bürgeramt Mitte', departmentName: null, locationIds: [4] },
      { shortName: 'Bürgeramt Eberhardshof', departmentName: null, locationIds: [116] },
      { shortName: 'Bürgeramt Frankenstraße', departmentName: null, locationIds: [64] },
      { shortName: 'Bürgeramt Nord', departmentName: 'Einwohnermelde- und Passangelegenheiten, Führerscheine, Beglaubigungen', locationIds: [34] },
      { shortName: 'Bürgeramt Ost', departmentName: null, locationIds: [24] },
      { shortName: 'Bürgeramt Süd', departmentName: null, locationIds: [14] },
      { shortName: 'Bürgerdienste in den Sparkassen', departmentName: null, locationIds: [38, 37, 28, 39] }
    ]
  },
  {
    id: 5,
    name: 'Neues Fahrzeug anmelden',
    concernIds: [81, 71, 396],
    locations: [
      { shortName: 'Ordnungsamt', departmentName: 'Bürgerdienste Mobilität', locationIds: [5, 5] },
      { shortName: 'Bürgeramt Ost', departmentName: null, locationIds: [32, 32] },
      { shortName: 'Bürgeramt Süd', departmentName: null, locationIds: [12, 12] }
    ]
  },
  {
    id: 6,
    name: 'Geschlechtseintrag ändern',
    concernIds: [313],
    locations: [
      { shortName: 'Bürgeramt Mitte', departmentName: 'Standesamt - Urkunden', locationIds: [22] }
    ]
  }
]

class AppointmentService {
  private readonly apiUrl = 'https://microservices.nuernberg.de/behoerdenwegweiser/tevis/dates'
  
  async fetchAppointmentDates(appointmentType: AppointmentType): Promise<AppointmentData[]> {
    const payload = {
      concernIds: appointmentType.concernIds,
      locations: appointmentType.locations
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'text/plain;charset=UTF-8',
          'Origin': 'https://www.nuernberg.de',
          'Referer': 'https://www.nuernberg.de/'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      
      if (data.success !== 1) {
        throw new Error('API returned unsuccessful response')
      }

      return data.data
    } catch (error) {
      console.error('Error fetching appointment dates:', error)
      throw error
    }
  }

  async checkForNewAppointments(appointmentType: AppointmentType, lastKnownTimestamp: number = 0): Promise<AppointmentLocation[]> {
    console.log(`[AppointmentService] Fetching appointments for type: ${appointmentType.name}`)
    console.log(`[AppointmentService] Filtering for appointments newer than: ${lastKnownTimestamp} (${new Date(lastKnownTimestamp).toLocaleString()})`)
    
    const appointmentData = await this.fetchAppointmentDates(appointmentType)
    const allAppointments: AppointmentLocation[] = []
    const newAppointments: AppointmentLocation[] = []

    appointmentData.forEach(data => {
      data.locations.forEach(location => {
        allAppointments.push(location)
        if (location.timestamp && location.timestamp > lastKnownTimestamp) {
          newAppointments.push(location)
        }
      })
    })

    console.log(`[AppointmentService] Total appointments found: ${allAppointments.length}`)
    console.log(`[AppointmentService] All appointments:`)
    allAppointments.forEach((apt, index) => {
      const isNew = apt.timestamp && apt.timestamp > lastKnownTimestamp
      const dateStr = apt.timestamp ? new Date(apt.timestamp * 1000).toLocaleString() : 'No timestamp'
      console.log(`  ${index + 1}. ${apt.place} - ${apt.date} - ${dateStr} - Timestamp: ${apt.timestamp} - ${isNew ? '🆕 NEW' : '⏸️ OLD'}`)
    })
    
    console.log(`[AppointmentService] New appointments (after timestamp filter): ${newAppointments.length}`)

    return newAppointments
  }
}

export const appointmentService = new AppointmentService()