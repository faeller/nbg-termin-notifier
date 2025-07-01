export default {
  // App title and header
  app: {
    title: 'Notificateur de Rendez-vous Nuremberg',
    settings: 'Paramètres'
  },
  
  // Navigation and general
  general: {
    close: 'Fermer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    remove: 'Supprimer',
    clear: 'Effacer',
    confirm: 'Confirmer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Information'
  },

  // Monitoring section
  monitoring: {
    title: 'Mises à jour automatiques',
    active: 'Surveillance en arrière-plan active',
    stopped: 'Surveillance en arrière-plan arrêtée',
    started: 'Surveillance en arrière-plan démarrée !',
    stoppedMsg: 'Surveillance en arrière-plan arrêtée !',
    frequency: 'Toutes les {seconds} secondes',
    enableNotifications: 'Veuillez activer les notifications dans les paramètres pour recevoir des alertes.',
    enableNotificationsBtn: 'Activer les notifications',
    selectAppointmentType: 'Veuillez sélectionner au moins un type de rendez-vous.'
  },

  // Appointment types
  appointments: {
    title: 'Types de rendez-vous disponibles',
    noData: 'Aucun rendez-vous disponible',
    loading: 'Chargement des rendez-vous...',
    error: 'Erreur lors du chargement des rendez-vous',
    makeReservation: 'Réserver',
    filter: 'Filtre',
    manage: 'Gérer',
    enableInstructions: 'Activez ce type de rendez-vous pour voir les rendez-vous disponibles et recevoir des notifications.'
  },

  // Individual appointment type names
  appointmentTypes: {
    registration: 'Enregistrer ou réenregistrer sa résidence',
    personalId: 'Demander une carte d\'identité',
    tempPersonalId: 'Demander une carte d\'identité temporaire',
    passport: 'Demander un passeport',
    vehicleRegistration: 'Enregistrer un nouveau véhicule',
    genderChange: 'Modifier l\'entrée de genre'
  },

  // Settings sections
  settings: {
    title: 'Paramètres',
    notifications: {
      title: 'Notifications',
      status: 'Statut',
      notSupported: 'Votre navigateur ne prend pas en charge les notifications.',
      enabled: 'Activé',
      disabled: 'Désactivé',
      enable: 'Activer les notifications'
    },
    polling: {
      title: 'Fréquence de sondage',
      label: 'Vérifier toutes les',
      unit: 'secondes'
    },
    background: {
      title: 'Image d\'arrière-plan',
      placeholder: 'Entrez l\'URL de l\'image d\'arrière-plan',
      set: 'Définir',
      remove: 'Supprimer'
    },
    analytics: {
      title: 'Analytique',
      enable: 'Autoriser la collecte de données',
      description: 'Les statistiques d\'usage anonymes aident à améliorer l\'application. Aucune donnée personnelle n\'est stockée.'
    },
    language: {
      title: 'Langue',
      german: 'Deutsch',
      english: 'English',
      russian: 'Русский',
      french: 'Français',
      dutch: 'Nederlands'
    }
  },

  // Filter modal
  filter: {
    title: 'Créer un filtre de notification',
    editTitle: 'Modifier le filtre de notification',
    appointmentType: 'Type de rendez-vous',
    locations: {
      title: 'Emplacements (optionnel)',
      description: 'Laisser vide pour tous les emplacements',
      placeholder: 'Sélectionner les emplacements...'
    },
    days: {
      title: 'Jours de la semaine (optionnel)',
      description: 'Laisser vide pour tous les jours'
    },
    times: {
      title: 'Heures (optionnel)',
      description: 'Laisser vide pour toutes les heures',
      add: 'Ajouter une plage horaire',
      from: 'De',
      to: 'À',
      invalidRange: 'Plage horaire invalide'
    },
    create: 'Créer le filtre',
    update: 'Mettre à jour le filtre'
  },

  // Subscription manager
  subscriptions: {
    title: '🔔 Gérer les abonnements aux notifications',
    empty: 'Aucun abonnement actif disponible',
    enabled: 'Activé',
    disabled: 'Désactivé',
    locations: 'Emplacements',
    days: 'Jours',
    times: 'Heures',
    allLocations: 'Tous les emplacements',
    allDays: 'Tous les jours',
    allTimes: 'Toutes les heures',
    toggleStatus: 'Basculer le statut',
    editSubscription: 'Modifier l\'abonnement',
    deleteSubscription: 'Supprimer l\'abonnement'
  },

  // Days of the week
  days: {
    sunday: 'Dimanche',
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi'
  },

  // Analytics banner
  analytics: {
    message: 'Cette application utilise des statistiques d\'usage anonymes pour s\'améliorer.',
    learnMore: 'En savoir plus',
    learnLess: 'Moins',
    decline: 'Refuser',
    accept: 'Accepter',
    details: 'Nous utilisons PostHog pour des statistiques d\'usage anonymes (vues de pages, clics). Aucune donnée personnelle n\'est stockée.',
    privacyLink: 'Détails de confidentialité'
  },

  // Countdown timer
  countdown: {
    updating: 'Mise à jour des données',
    nextCheck: 'Prochaine vérification'
  }
}