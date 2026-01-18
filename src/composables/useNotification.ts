import { ref, computed } from 'vue'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: number
  type: NotificationType
  message: string
  duration?: number
}

export function useNotification() {
  const notifications = ref<Notification[]>([])
  let nextId = 1

  const showNotification = (message: string, type: NotificationType = 'info', duration = 4000) => {
    const id = nextId++
    const notification: Notification = {
      id,
      type,
      message,
      duration
    }

    notifications.value.push(notification)

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const showSuccess = (message: string, duration = 4000) => {
    return showNotification(message, 'success', duration)
  }

  const showError = (message: string, duration = 5000) => {
    return showNotification(message, 'error', duration)
  }

  const showWarning = (message: string, duration = 4000) => {
    return showNotification(message, 'warning', duration)
  }

  const showInfo = (message: string, duration = 3000) => {
    return showNotification(message, 'info', duration)
  }

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  const clearAll = () => {
    notifications.value = []
  }

  const hasNotifications = computed(() => notifications.value.length > 0)

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll,
    hasNotifications
  }
}
