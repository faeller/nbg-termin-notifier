import { createI18n } from 'vue-i18n'

// Language translations
const messages = {
  de: {
    // App title and header
    app: {
      title: 'Nürnberg Termin Notifier',
      settings: 'Einstellungen'
    },
    
    // Navigation and general
    general: {
      close: 'Schließen',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      remove: 'Entfernen',
      clear: 'Löschen',
      confirm: 'Bestätigen',
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolgreich',
      warning: 'Warnung',
      info: 'Information'
    },

    // Monitoring section
    monitoring: {
      title: 'Automatische Aktualisierung',
      active: 'Hintergrund-Überwachung aktiv',
      stopped: 'Hintergrund-Überwachung gestoppt',
      started: 'Hintergrund-Überwachung gestartet!',
      stoppedMsg: 'Hintergrund-Überwachung gestoppt!',
      frequency: 'Alle {seconds} Sekunden',
      enableNotifications: 'Bitte aktivieren Sie Benachrichtigungen in den Einstellungen, um Alerts zu erhalten.',
      enableNotificationsBtn: 'Benachrichtigungen aktivieren',
      selectAppointmentType: 'Bitte wählen Sie mindestens einen Termintyp aus.'
    },

    // Appointment types
    appointments: {
      title: 'Verfügbare Termintypen',
      noData: 'Keine Termine verfügbar',
      loading: 'Lade Termine...',
      error: 'Fehler beim Laden der Termine',
      makeReservation: 'Reservieren',
      filter: 'Filter',
      manage: 'Verwalten',
      enableInstructions: 'Aktivieren Sie diesen Termintyp, um verfügbare Termine zu sehen und Benachrichtigungen zu erhalten.'
    },

    // Individual appointment type names
    appointmentTypes: {
      registration: 'Wohnung anmelden oder ummelden',
      personalId: 'Personalausweis beantragen',
      tempPersonalId: 'Vorläufigen Personalausweis beantragen',
      passport: 'Reisepass beantragen',
      vehicleRegistration: 'Neues Fahrzeug anmelden',
      genderChange: 'Geschlechtseintrag ändern'
    },

    // Settings sections
    settings: {
      title: 'Einstellungen',
      notifications: {
        title: 'Benachrichtigungen',
        status: 'Status',
        notSupported: 'Ihr Browser unterstützt keine Benachrichtigungen.',
        enabled: 'Aktiviert',
        disabled: 'Deaktiviert',
        enable: 'Benachrichtigungen aktivieren'
      },
      polling: {
        title: 'Polling-Frequenz',
        label: 'Alle',
        unit: 'Sekunden prüfen'
      },
      background: {
        title: 'Hintergrundbild',
        placeholder: 'URL zum Hintergrundbild eingeben',
        set: 'Setzen',
        remove: 'Entfernen'
      },
      analytics: {
        title: 'Analytics',
        enable: 'Datenerfassung erlauben',
        description: 'Anonyme Nutzungsstatistiken helfen bei der Verbesserung der App. Es werden keine persönlichen Daten gespeichert.'
      },
      language: {
        title: 'Sprache',
        german: 'Deutsch',
        english: 'English'
      }
    },

    // Filter modal
    filter: {
      title: 'Benachrichtigungs-Filter erstellen',
      editTitle: 'Benachrichtigungs-Filter bearbeiten',
      appointmentType: 'Termintyp',
      locations: {
        title: 'Standorte (optional)',
        description: 'Leer lassen für alle Standorte',
        placeholder: 'Standorte auswählen...'
      },
      days: {
        title: 'Wochentage (optional)',
        description: 'Leer lassen für alle Tage'
      },
      times: {
        title: 'Uhrzeiten (optional)',
        description: 'Leer lassen für alle Zeiten',
        add: 'Zeitbereich hinzufügen',
        from: 'Von',
        to: 'Bis',
        invalidRange: 'Ungültiger Zeitbereich'
      },
      create: 'Filter erstellen',
      update: 'Filter aktualisieren'
    },

    // Subscription manager
    subscriptions: {
      title: '🔔 Benachrichtigungs-Abonnements verwalten',
      empty: 'Keine aktiven Abonnements vorhanden',
      enabled: 'Aktiviert',
      disabled: 'Deaktiviert',
      locations: 'Standorte',
      days: 'Tage',
      times: 'Zeiten',
      allLocations: 'Alle Standorte',
      allDays: 'Alle Tage',
      allTimes: 'Alle Zeiten',
      toggleStatus: 'Status umschalten',
      editSubscription: 'Abonnement bearbeiten',
      deleteSubscription: 'Abonnement löschen'
    },

    // Days of the week
    days: {
      sunday: 'Sonntag',
      monday: 'Montag',
      tuesday: 'Dienstag',
      wednesday: 'Mittwoch',
      thursday: 'Donnerstag',
      friday: 'Freitag',
      saturday: 'Samstag'
    },

    // Analytics banner
    analytics: {
      message: 'Diese App verwendet anonyme Nutzungsstatistiken zur Verbesserung.',
      learnMore: 'Mehr erfahren',
      learnLess: 'Weniger',
      decline: 'Ablehnen',
      accept: 'Akzeptieren',
      details: 'Wir verwenden PostHog für anonyme Nutzungsstatistiken (Seitenaufrufe, Klicks). Keine persönlichen Daten werden gespeichert.',
      privacyLink: 'Datenschutz-Details'
    }
  },

  en: {
    // App title and header
    app: {
      title: 'Nuremberg Appointment Notifier',
      settings: 'Settings'
    },
    
    // Navigation and general
    general: {
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      clear: 'Clear',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information'
    },

    // Monitoring section
    monitoring: {
      title: 'Automatic Updates',
      active: 'Background monitoring active',
      stopped: 'Background monitoring stopped',
      started: 'Background monitoring started!',
      stoppedMsg: 'Background monitoring stopped!',
      frequency: 'Every {seconds} seconds',
      enableNotifications: 'Please enable notifications in settings to receive alerts.',
      enableNotificationsBtn: 'Enable notifications',
      selectAppointmentType: 'Please select at least one appointment type.'
    },

    // Appointment types
    appointments: {
      title: 'Available Appointment Types',
      noData: 'No appointments available',
      loading: 'Loading appointments...',
      error: 'Error loading appointments',
      makeReservation: 'Make Reservation',
      filter: 'Filter',
      manage: 'Manage',
      enableInstructions: 'Enable this appointment type to see available appointments and receive notifications.'
    },

    // Individual appointment type names
    appointmentTypes: {
      registration: 'Register or re-register residence',
      personalId: 'Apply for personal ID',
      tempPersonalId: 'Apply for temporary personal ID',
      passport: 'Apply for passport',
      vehicleRegistration: 'Register new vehicle',
      genderChange: 'Change gender entry'
    },

    // Settings sections
    settings: {
      title: 'Settings',
      notifications: {
        title: 'Notifications',
        status: 'Status',
        notSupported: 'Your browser does not support notifications.',
        enabled: 'Enabled',
        disabled: 'Disabled',
        enable: 'Enable notifications'
      },
      polling: {
        title: 'Polling Frequency',
        label: 'Check every',
        unit: 'seconds'
      },
      background: {
        title: 'Background Image',
        placeholder: 'Enter background image URL',
        set: 'Set',
        remove: 'Remove'
      },
      analytics: {
        title: 'Analytics',
        enable: 'Allow data collection',
        description: 'Anonymous usage statistics help improve the app. No personal data is stored.'
      },
      language: {
        title: 'Language',
        german: 'Deutsch',
        english: 'English'
      }
    },

    // Filter modal
    filter: {
      title: 'Create Notification Filter',
      editTitle: 'Edit Notification Filter',
      appointmentType: 'Appointment Type',
      locations: {
        title: 'Locations (optional)',
        description: 'Leave empty for all locations',
        placeholder: 'Select locations...'
      },
      days: {
        title: 'Weekdays (optional)',
        description: 'Leave empty for all days'
      },
      times: {
        title: 'Times (optional)',
        description: 'Leave empty for all times',
        add: 'Add time range',
        from: 'From',
        to: 'To',
        invalidRange: 'Invalid time range'
      },
      create: 'Create Filter',
      update: 'Update Filter'
    },

    // Subscription manager
    subscriptions: {
      title: '🔔 Manage Notification Subscriptions',
      empty: 'No active subscriptions available',
      enabled: 'Enabled',
      disabled: 'Disabled',
      locations: 'Locations',
      days: 'Days',
      times: 'Times',
      allLocations: 'All locations',
      allDays: 'All days',
      allTimes: 'All times',
      toggleStatus: 'Toggle status',
      editSubscription: 'Edit subscription',
      deleteSubscription: 'Delete subscription'
    },

    // Days of the week
    days: {
      sunday: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday'
    },

    // Analytics banner
    analytics: {
      message: 'This app uses anonymous usage statistics for improvement.',
      learnMore: 'Learn more',
      learnLess: 'Less',
      decline: 'Decline',
      accept: 'Accept',
      details: 'We use PostHog for anonymous usage statistics (page views, clicks). No personal data is stored.',
      privacyLink: 'Privacy Details'
    }
  }
}

// Create i18n instance
export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'de', // Default to German
  fallbackLocale: 'de',
  messages
})

// Helper function to change language
export function setLanguage(locale: string) {
  i18n.global.locale.value = locale as any
  localStorage.setItem('language', locale)
}

// Export available locales
export const availableLocales = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' }
]