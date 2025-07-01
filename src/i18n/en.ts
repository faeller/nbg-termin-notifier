export default {
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
      english: 'English',
      russian: 'Русский',
      french: 'Français',
      dutch: 'Nederlands'
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
  },

  // Countdown timer
  countdown: {
    updating: 'Updating data',
    nextCheck: 'Next check'
  }
}