export default {
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
      english: 'English',
      russian: 'Русский',
      french: 'Français',
      dutch: 'Nederlands'
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
  },

  // Countdown timer
  countdown: {
    updating: 'Aktualisiere Daten',
    nextCheck: 'Nächste Prüfung'
  }
}