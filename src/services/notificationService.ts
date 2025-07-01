import type { AppointmentLocation } from './appointmentService'

export enum NotificationPermission {
  GRANTED = 'granted',
  DENIED = 'denied',
  DEFAULT = 'default'
}

class NotificationService {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return NotificationPermission.DENIED
    }

    if (Notification.permission === 'granted') {
      return NotificationPermission.GRANTED
    }

    const permission = await Notification.requestPermission()
    return permission as NotificationPermission
  }

  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return NotificationPermission.DENIED
    }
    return Notification.permission as NotificationPermission
  }

  async showAppointmentNotification(appointment: AppointmentLocation, appointmentTypeName: string): Promise<void> {
    const permission = await this.requestPermission()
    
    if (permission !== NotificationPermission.GRANTED) {
      console.warn('Notification permission not granted')
      return
    }

    const title = `Neuer Termin verfügbar: ${appointmentTypeName}`
    const body = `${appointment.place2 || appointment.place}\n${appointment.date}`
    const icon = '/favicon.ico'

    const notification = new Notification(title, {
      body,
      icon,
      tag: `appointment-${appointment.loc_id}-${appointment.timestamp}`,
      requireInteraction: true
    })

    notification.onclick = () => {
      window.open(appointment.reservation_link, '_blank')
      notification.close()
    }

    setTimeout(() => {
      notification.close()
    }, 10000)
  }

  async showFilteredAppointmentNotification(
    appointment: AppointmentLocation, 
    appointmentTypeName: string,
    filterDescription?: string
  ): Promise<void> {
    const permission = await this.requestPermission()
    
    if (permission !== NotificationPermission.GRANTED) {
      console.warn('Notification permission not granted')
      return
    }

    const title = `🎯 Gefilterte Termin-Benachrichtigung`
    const body = `${appointmentTypeName}\n📍 ${appointment.place2 || appointment.place}\n📅 ${appointment.date}${filterDescription ? `\n🔍 ${filterDescription}` : ''}`
    const icon = '/favicon.ico'

    const notification = new Notification(title, {
      body,
      icon,
      tag: `filtered-${appointment.loc_id}-${appointment.timestamp}`,
      requireInteraction: true
    })

    notification.onclick = () => {
      window.open(appointment.reservation_link, '_blank')
      notification.close()
    }

    setTimeout(() => {
      notification.close()
    }, 15000) // Longer timeout for filtered notifications
  }

  async showSubscriptionNotification(appointmentTypeName: string): Promise<void> {
    const permission = await this.requestPermission()
    
    if (permission !== NotificationPermission.GRANTED) {
      console.warn('Notification permission not granted')
      return
    }

    const title = '🔔 Termin-Überwachung aktiviert'
    const body = `Sie erhalten Benachrichtigungen für neue Termine: ${appointmentTypeName}`
    const icon = '/favicon.ico'

    const notification = new Notification(title, {
      body,
      icon,
      tag: `subscription-${Date.now()}`,
      requireInteraction: false
    })

    setTimeout(() => {
      notification.close()
    }, 5000)
  }

  isSupported(): boolean {
    return 'Notification' in window
  }
}

export const notificationService = new NotificationService()