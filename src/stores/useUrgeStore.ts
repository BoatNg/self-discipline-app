import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, UrgeLog, InterventionType, Outcome } from '@/types'

export const useUrgeStore = defineStore(
  'urge',
  () => {
    const tasks = ref<Task[]>([
      { id: '1', name: '不刷短视频', isEnabled: true },
      { id: '2', name: '不吃零食', isEnabled: true },
      { id: '3', name: '不冲动购物', isEnabled: true }
    ])

    const urgeLogs = ref<UrgeLog[]>([])

    const currentInterventionType = ref<InterventionType | null>(null)
    const isInIntervention = ref(false)
    const currentInterventionStartTime = ref<number | null>(null)

    const todayCount = computed(() => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = today.getTime()

      return urgeLogs.value.filter((log) => {
        const logDate = new Date(log.timestamp)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() >= todayTimestamp
      }).length
    })

    const todayToolUsage = computed(() => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = today.getTime()

      return urgeLogs.value.filter((log) => {
        const logDate = new Date(log.timestamp)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() >= todayTimestamp && log.isCompleted
      }).length
    })

    const addTask = (name: string) => {
      const newTask: Task = {
        id: Date.now().toString(),
        name,
        isEnabled: true
      }
      tasks.value.push(newTask)
      return newTask
    }

    const toggleTask = (id: string) => {
      const task = tasks.value.find((t) => t.id === id)
      if (task) {
        task.isEnabled = !task.isEnabled
      }
    }

    const startIntervention = (interventionType: InterventionType) => {
      isInIntervention.value = true
      currentInterventionType.value = interventionType
      currentInterventionStartTime.value = Date.now()

      const newLog: UrgeLog = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        assignedIntervention: interventionType,
        isCompleted: false,
        outcome: null
      }
      urgeLogs.value.unshift(newLog)

      return newLog
    }

    const markInterventionCompleted = () => {
      if (urgeLogs.value.length > 0) {
        urgeLogs.value[0].isCompleted = true
      }
    }

    const setTriggerReason = (reason: string) => {
      if (urgeLogs.value.length > 0) {
        urgeLogs.value[0].triggerReason = reason
      }
    }

    const setCognitiveTag = (tag: string) => {
      if (urgeLogs.value.length > 0) {
        urgeLogs.value[0].cognitiveTag = tag
      }
    }

    const completeIntervention = (outcome: Outcome) => {
      if (urgeLogs.value.length > 0) {
        urgeLogs.value[0].outcome = outcome
      }

      currentInterventionType.value = null
      isInIntervention.value = false
      currentInterventionStartTime.value = null
    }

    const cancelIntervention = () => {
      currentInterventionType.value = null
      isInIntervention.value = false
      currentInterventionStartTime.value = null
    }

    const deleteTask = (id: string) => {
      tasks.value = tasks.value.filter((task) => task.id !== id)
    }

    return {
      tasks,
      urgeLogs,
      currentInterventionType,
      isInIntervention,
      currentInterventionStartTime,
      todayCount,
      todayToolUsage,
      addTask,
      toggleTask,
      startIntervention,
      markInterventionCompleted,
      setTriggerReason,
      setCognitiveTag,
      completeIntervention,
      cancelIntervention,
      deleteTask
    }
  },
  {
    persist: {
      key: 'self-discipline-app-store',
      paths: ['tasks', 'urgeLogs']
    }
  }
)
