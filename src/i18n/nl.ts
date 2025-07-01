export default {
  // App title and header
  app: {
    title: 'Neurenberg Afspraak Notificatie',
    settings: 'Instellingen'
  },
  
  // Navigation and general
  general: {
    close: 'Sluiten',
    cancel: 'Annuleren',
    save: 'Opslaan',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    add: 'Toevoegen',
    remove: 'Verwijderen',
    clear: 'Wissen',
    confirm: 'Bevestigen',
    loading: 'Laden...',
    error: 'Fout',
    success: 'Succes',
    warning: 'Waarschuwing',
    info: 'Informatie'
  },

  // Monitoring section
  monitoring: {
    title: 'Automatische updates',
    active: 'Achtergrondmonitoring actief',
    stopped: 'Achtergrondmonitoring gestopt',
    started: 'Achtergrondmonitoring gestart!',
    stoppedMsg: 'Achtergrondmonitoring gestopt!',
    frequency: 'Elke {seconds} seconden',
    enableNotifications: 'Schakel meldingen in via instellingen om waarschuwingen te ontvangen.',
    enableNotificationsBtn: 'Meldingen inschakelen',
    selectAppointmentType: 'Selecteer ten minste één afspraaktype.'
  },

  // Appointment types
  appointments: {
    title: 'Beschikbare afspraaktypes',
    noData: 'Geen afspraken beschikbaar',
    loading: 'Afspraken laden...',
    error: 'Fout bij het laden van afspraken',
    makeReservation: 'Reserveren',
    filter: 'Filter',
    manage: 'Beheren',
    enableInstructions: 'Schakel dit afspraaktype in om beschikbare afspraken te zien en meldingen te ontvangen.'
  },

  // Individual appointment type names
  appointmentTypes: {
    registration: 'Woning aanmelden of heraanmelden',
    personalId: 'Persoonsbewijs aanvragen',
    tempPersonalId: 'Tijdelijk persoonsbewijs aanvragen',
    passport: 'Paspoort aanvragen',
    vehicleRegistration: 'Nieuw voertuig registreren',
    genderChange: 'Geslachtsinvoer wijzigen'
  },

  // Settings sections
  settings: {
    title: 'Instellingen',
    notifications: {
      title: 'Meldingen',
      status: 'Status',
      notSupported: 'Uw browser ondersteunt geen meldingen.',
      enabled: 'Ingeschakeld',
      disabled: 'Uitgeschakeld',
      enable: 'Meldingen inschakelen'
    },
    polling: {
      title: 'Polling frequentie',
      label: 'Controleer elke',
      unit: 'seconden'
    },
    background: {
      title: 'Achtergrondafbeelding',
      placeholder: 'Voer de URL van de achtergrondafbeelding in',
      set: 'Instellen',
      remove: 'Verwijderen'
    },
    analytics: {
      title: 'Analytics',
      enable: 'Gegevensverzameling toestaan',
      description: 'Anonieme gebruiksstatistieken helpen de app te verbeteren. Er worden geen persoonlijke gegevens opgeslagen.'
    },
    language: {
      title: 'Taal',
      german: 'Deutsch',
      english: 'English',
      russian: 'Русский',
      french: 'Français',
      dutch: 'Nederlands'
    }
  },

  // Filter modal
  filter: {
    title: 'Meldingsfilter maken',
    editTitle: 'Meldingsfilter bewerken',
    appointmentType: 'Afspraaktype',
    locations: {
      title: 'Locaties (optioneel)',
      description: 'Laat leeg voor alle locaties',
      placeholder: 'Selecteer locaties...'
    },
    days: {
      title: 'Weekdagen (optioneel)',
      description: 'Laat leeg voor alle dagen'
    },
    times: {
      title: 'Tijden (optioneel)',
      description: 'Laat leeg voor alle tijden',
      add: 'Tijdsbereik toevoegen',
      from: 'Van',
      to: 'Tot',
      invalidRange: 'Ongeldig tijdsbereik'
    },
    create: 'Filter maken',
    update: 'Filter bijwerken'
  },

  // Subscription manager
  subscriptions: {
    title: '🔔 Meldingsabonnementen beheren',
    empty: 'Geen actieve abonnementen beschikbaar',
    enabled: 'Ingeschakeld',
    disabled: 'Uitgeschakeld',
    locations: 'Locaties',
    days: 'Dagen',
    times: 'Tijden',
    allLocations: 'Alle locaties',
    allDays: 'Alle dagen',
    allTimes: 'Alle tijden',
    toggleStatus: 'Status omschakelen',
    editSubscription: 'Abonnement bewerken',
    deleteSubscription: 'Abonnement verwijderen'
  },

  // Days of the week
  days: {
    sunday: 'Zondag',
    monday: 'Maandag',
    tuesday: 'Dinsdag',
    wednesday: 'Woensdag',
    thursday: 'Donderdag',
    friday: 'Vrijdag',
    saturday: 'Zaterdag'
  },

  // Analytics banner
  analytics: {
    message: 'Deze app gebruikt anonieme gebruiksstatistieken voor verbetering.',
    learnMore: 'Meer weten',
    learnLess: 'Minder',
    decline: 'Weigeren',
    accept: 'Accepteren',
    details: 'We gebruiken PostHog voor anonieme gebruiksstatistieken (paginaweergaven, klikken). Er worden geen persoonlijke gegevens opgeslagen.',
    privacyLink: 'Privacydetails'
  },

  // Countdown timer
  countdown: {
    updating: 'Gegevens bijwerken',
    nextCheck: 'Volgende controle'
  }
}