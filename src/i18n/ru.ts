export default {
  // App title and header
  app: {
    title: 'Нюрнберг Уведомления о записи',
    settings: 'Настройки'
  },
  
  // Navigation and general
  general: {
    close: 'Закрыть',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    add: 'Добавить',
    remove: 'Удалить',
    clear: 'Очистить',
    confirm: 'Подтвердить',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    warning: 'Предупреждение',
    info: 'Информация'
  },

  // Monitoring section
  monitoring: {
    title: 'Автоматические обновления',
    active: 'Фоновый мониторинг активен',
    stopped: 'Фоновый мониторинг остановлен',
    started: 'Фоновый мониторинг запущен!',
    stoppedMsg: 'Фоновый мониторинг остановлен!',
    frequency: 'Каждые {seconds} секунд',
    enableNotifications: 'Пожалуйста, включите уведомления в настройках для получения оповещений.',
    enableNotificationsBtn: 'Включить уведомления',
    selectAppointmentType: 'Пожалуйста, выберите хотя бы один тип записи.'
  },

  // Appointment types
  appointments: {
    title: 'Доступные типы записей',
    noData: 'Нет доступных записей',
    loading: 'Загрузка записей...',
    error: 'Ошибка при загрузке записей',
    makeReservation: 'Забронировать',
    filter: 'Фильтр',
    manage: 'Управление',
    enableInstructions: 'Включите этот тип записи, чтобы видеть доступные записи и получать уведомления.'
  },

  // Individual appointment type names
  appointmentTypes: {
    registration: 'Регистрация или перерегистрация места жительства',
    personalId: 'Подача заявления на личное удостоверение',
    tempPersonalId: 'Подача заявления на временное личное удостоверение',
    passport: 'Подача заявления на паспорт',
    vehicleRegistration: 'Регистрация нового транспортного средства',
    genderChange: 'Изменение записи о поле'
  },

  // Settings sections
  settings: {
    title: 'Настройки',
    notifications: {
      title: 'Уведомления',
      status: 'Статус',
      notSupported: 'Ваш браузер не поддерживает уведомления.',
      enabled: 'Включено',
      disabled: 'Отключено',
      enable: 'Включить уведомления'
    },
    polling: {
      title: 'Частота опроса',
      label: 'Проверять каждые',
      unit: 'секунд'
    },
    background: {
      title: 'Фоновое изображение',
      placeholder: 'Введите URL фонового изображения',
      set: 'Установить',
      remove: 'Удалить'
    },
    analytics: {
      title: 'Аналитика',
      enable: 'Разрешить сбор данных',
      description: 'Анонимная статистика использования помогает улучшить приложение. Личные данные не сохраняются.'
    },
    language: {
      title: 'Язык',
      german: 'Deutsch',
      english: 'English',
      russian: 'Русский',
      french: 'Français',
      dutch: 'Nederlands'
    }
  },

  // Filter modal
  filter: {
    title: 'Создать фильтр уведомлений',
    editTitle: 'Редактировать фильтр уведомлений',
    appointmentType: 'Тип записи',
    locations: {
      title: 'Места (опционально)',
      description: 'Оставьте пустым для всех мест',
      placeholder: 'Выберите места...'
    },
    days: {
      title: 'Дни недели (опционально)',
      description: 'Оставьте пустым для всех дней'
    },
    times: {
      title: 'Время (опционально)',
      description: 'Оставьте пустым для всех времен',
      add: 'Добавить временной диапазон',
      from: 'С',
      to: 'До',
      invalidRange: 'Недопустимый временной диапазон'
    },
    create: 'Создать фильтр',
    update: 'Обновить фильтр'
  },

  // Subscription manager
  subscriptions: {
    title: '🔔 Управление подписками на уведомления',
    empty: 'Нет активных подписок',
    enabled: 'Включено',
    disabled: 'Отключено',
    locations: 'Места',
    days: 'Дни',
    times: 'Время',
    allLocations: 'Все места',
    allDays: 'Все дни',
    allTimes: 'Все время',
    toggleStatus: 'Переключить статус',
    editSubscription: 'Редактировать подписку',
    deleteSubscription: 'Удалить подписку'
  },

  // Days of the week
  days: {
    sunday: 'Воскресенье',
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота'
  },

  // Analytics banner
  analytics: {
    message: 'Это приложение использует анонимную статистику использования для улучшения.',
    learnMore: 'Подробнее',
    learnLess: 'Меньше',
    decline: 'Отклонить',
    accept: 'Принять',
    details: 'Мы используем PostHog для анонимной статистики использования (просмотры страниц, клики). Личные данные не сохраняются.',
    privacyLink: 'Детали конфиденциальности'
  },

  // Countdown timer
  countdown: {
    updating: 'Обновление данных',
    nextCheck: 'Следующая проверка'
  }
}