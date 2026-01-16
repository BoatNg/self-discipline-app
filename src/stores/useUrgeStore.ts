import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, UrgeLog, InterventionType, Outcome, TaskStats } from '@/types'

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

    const recentTasks = computed(() => {
      // 获取最近关联的任务（按关联时间倒序）
      const taskAssociations = urgeLogs.value
        .filter((log) => log.taskId && log.taskId !== '')
        .map((log) => ({
          taskId: log.taskId!,
          timestamp: log.timestamp
        }))
        .sort((a, b) => b.timestamp - a.timestamp)

      // 去重，保留每个任务的最新关联记录
      const uniqueTasks = []
      const seenTaskIds = new Set<string>()

      for (const association of taskAssociations) {
        if (!seenTaskIds.has(association.taskId)) {
          seenTaskIds.add(association.taskId)
          const task = tasks.value.find((t) => t.id === association.taskId)
          if (task) {
            uniqueTasks.push(task)
          }
        }
      }

      // 如果最近关联的任务不足，补充最近创建的任务
      if (uniqueTasks.length < 5) {
        const recentCreatedTasks = [...tasks.value]
          .sort((a, b) => parseInt(b.id) - parseInt(a.id)) // 按ID倒序（假设ID是时间戳）
          .filter((task) => !seenTaskIds.has(task.id))
          .slice(0, 5 - uniqueTasks.length)

        uniqueTasks.push(...recentCreatedTasks)
      }

      return uniqueTasks.slice(0, 5) // 最多返回5个任务
    })

    const taskStats = computed(() => {
      const statsMap = new Map<string, TaskStats>()

      // 初始化所有任务的统计
      tasks.value.forEach((task) => {
        statsMap.set(task.id, {
          taskId: task.id,
          taskName: task.name,
          associationCount: 0,
          resistedCount: 0,
          relapsedCount: 0,
          successRate: 0,
          lastAssociatedAt: undefined
        })
      })

      // 计算统计信息
      urgeLogs.value.forEach((log) => {
        if (log.taskId && log.taskId !== '') {
          const stat = statsMap.get(log.taskId)
          if (stat) {
            stat.associationCount++

            if (log.outcome === 'resisted') {
              stat.resistedCount++
            } else if (log.outcome === 'relapsed') {
              stat.relapsedCount++
            }

            // 更新最后关联时间
            if (!stat.lastAssociatedAt || log.timestamp > stat.lastAssociatedAt) {
              stat.lastAssociatedAt = log.timestamp
            }
          }
        }
      })

      // 计算成功率
      statsMap.forEach((stat) => {
        const totalOutcomes = stat.resistedCount + stat.relapsedCount
        if (totalOutcomes > 0) {
          stat.successRate = Math.round((stat.resistedCount / totalOutcomes) * 100)
        }
      })

      return Array.from(statsMap.values())
    })

    const getTaskStats = (taskId: string) => {
      return taskStats.value.find((stat) => stat.taskId === taskId)
    }

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

    const completeIntervention = (outcome: Outcome, taskId?: string) => {
      if (urgeLogs.value.length > 0) {
        urgeLogs.value[0].outcome = outcome
        urgeLogs.value[0].taskId = taskId
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
      recentTasks,
      taskStats,
      addTask,
      toggleTask,
      startIntervention,
      markInterventionCompleted,
      setTriggerReason,
      setCognitiveTag,
      completeIntervention,
      cancelIntervention,
      deleteTask,
      getTaskStats
    }
  },
  {
    persist: {
      key: 'self-discipline-app-store',
      paths: ['tasks', 'urgeLogs']
    }
  }
)
