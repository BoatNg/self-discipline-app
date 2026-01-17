import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Task,
  UrgeLog,
  InterventionType,
  Outcome,
  TaskStats,
  TaskType,
  PeriodType,
  TaskStatus,
  CheckInRecord
} from '@/types'

export const useUrgeStore = defineStore(
  'urge',
  () => {
    const tasks = ref<Task[]>([
      {
        id: '1',
        name: '不刷短视频',
        type: 'DONT_WANT' as TaskType,
        isEnabled: true,
        startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7天前
        endDate: Date.now() + 23 * 24 * 60 * 60 * 1000, // 23天后
        periodType: 'DAILY' as PeriodType
      },
      {
        id: '2',
        name: '不吃零食',
        type: 'DONT_WANT' as TaskType,
        isEnabled: true,
        startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        endDate: Date.now() + 23 * 24 * 60 * 60 * 1000,
        periodType: 'DAILY' as PeriodType
      },
      {
        id: '3',
        name: '不冲动购物',
        type: 'DONT_WANT' as TaskType,
        isEnabled: true,
        startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        endDate: Date.now() + 23 * 24 * 60 * 60 * 1000,
        periodType: 'DAILY' as PeriodType
      },
      {
        id: '4',
        name: '每天读书30分钟',
        type: 'DO_WANT' as TaskType,
        isEnabled: true,
        startDate: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3天前
        endDate: Date.now() + 27 * 24 * 60 * 60 * 1000, // 27天后
        periodType: 'DAILY' as PeriodType
      }
    ])

    const urgeLogs = ref<UrgeLog[]>([])
    const checkInRecords = ref<CheckInRecord[]>([]) // 新增：打卡记录

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

    // 新增：获取今天的日期键
    const getTodayDateKey = () => {
      const today = new Date()
      return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    }

    // 新增：检查今天是否已打卡
    const hasCheckedInToday = (taskId: string) => {
      const todayKey = getTodayDateKey()
      return checkInRecords.value.some(
        (record) => record.taskId === taskId && record.dateKey === todayKey && record.isCompleted
      )
    }

    // 新增：判断任务是否过期
    const isTaskExpired = (task: Task) => {
      const now = Date.now()
      return now > task.endDate
    }

    // 新增：判断任务是否在有效期内
    const isTaskActive = (task: Task) => {
      const now = Date.now()
      return now >= task.startDate && now <= task.endDate
    }

    // 新增：计算任务状态
    const calculateTaskStatus = (task: Task): TaskStatus => {
      const now = Date.now()

      // 任务未开始
      if (now < task.startDate) return 'ACTIVE'

      // 任务已过期
      if (now > task.endDate) {
        // 获取该任务的打卡记录
        const taskCheckIns = checkInRecords.value.filter(
          (record) => record.taskId === task.id && record.isCompleted
        )

        const totalDays = Math.ceil((task.endDate - task.startDate) / (24 * 60 * 60 * 1000))
        const completedDays = taskCheckIns.length

        // 如果有设置目标完成次数，使用目标值；否则要求100%完成
        const targetDays = task.targetCompletion || totalDays
        const completionRate = completedDays / targetDays

        return completionRate >= 1 ? 'COMPLETED' : 'FAILED'
      }

      // 任务进行中
      return 'ACTIVE'
    }

    // 新增：获取任务打卡记录
    const getTaskCheckIns = (taskId: string) => {
      return checkInRecords.value.filter((record) => record.taskId === taskId)
    }

    // 新增：获取今日打卡记录
    const getTodayCheckIns = () => {
      const todayKey = getTodayDateKey()
      return checkInRecords.value.filter((record) => record.dateKey === todayKey)
    }

    // 新增：打卡核心逻辑
    const checkIn = (taskId: string) => {
      // 检查任务是否存在
      const task = tasks.value.find((t) => t.id === taskId)
      if (!task) {
        throw new Error('任务不存在')
      }

      // 检查任务是否在有效期内
      if (!isTaskActive(task)) {
        throw new Error('任务不在有效期内')
      }

      // 检查今天是否已打卡
      if (hasCheckedInToday(taskId)) {
        throw new Error('今日已打卡')
      }

      // 创建打卡记录
      const checkInRecord: CheckInRecord = {
        id: Date.now().toString(),
        taskId,
        timestamp: Date.now(),
        isCompleted: true,
        dateKey: getTodayDateKey()
      }

      // 保存记录
      checkInRecords.value.push(checkInRecord)
      return checkInRecord
    }

    // 新增：获取活跃任务列表（显示所有启用的任务，无论是否开始或过期）
    const activeTasks = computed(() => {
      return tasks.value.filter((task) => task.isEnabled)
    })

    // 新增：获取过期任务列表
    const expiredTasks = computed(() => {
      return tasks.value.filter((task) => isTaskExpired(task))
    })

    // 新增：获取今日完成打卡数
    const todayCheckInCount = computed(() => {
      return getTodayCheckIns().filter((record) => record.isCompleted).length
    })

    // 新增：获取今日"我想要"任务完成率
    const todayDoWantCompletionRate = computed(() => {
      // 获取今天在有效期内且需要打卡的"我想要"类型的任务
      const todayDoWantTasks = tasks.value.filter(
        (task) => task.type === 'DO_WANT' && task.isEnabled && isTaskActive(task)
      )
      if (todayDoWantTasks.length === 0) return 100 // 没有今天需要打卡的"我想要"任务时显示100%

      let completedToday = 0

      todayDoWantTasks.forEach((task) => {
        if (hasCheckedInToday(task.id)) {
          completedToday++
        }
      })

      return Math.round((completedToday / todayDoWantTasks.length) * 100)
    })

    const addTask = (
      name: string,
      type: TaskType = 'DONT_WANT',
      startDate?: number,
      endDate?: number,
      periodType?: PeriodType,
      customDays?: number,
      targetCompletion?: number
    ) => {
      const now = Date.now()
      const defaultStartDate = now
      const defaultEndDate = now + 30 * 24 * 60 * 60 * 1000 // 默认30天

      // 为"我不要"类型的任务设置默认周期类型
      const defaultPeriodType = type === 'DO_WANT' ? 'DAILY' : 'DAILY'

      const newTask: Task = {
        id: Date.now().toString(),
        name,
        type,
        isEnabled: true,
        startDate: startDate || defaultStartDate,
        endDate: endDate || defaultEndDate,
        periodType: periodType || defaultPeriodType,
        customDays,
        targetCompletion
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

    const startIntervention = (interventionType: InterventionType, urgeId?: string) => {
      isInIntervention.value = true
      currentInterventionType.value = interventionType
      currentInterventionStartTime.value = Date.now()

      let urgeLog: UrgeLog

      if (urgeId) {
        // 如果传入了干预ID，查找并更新现有的记录
        const existingLog = urgeLogs.value.find((log) => log.id === urgeId)
        if (existingLog) {
          existingLog.assignedIntervention = interventionType
          existingLog.isCompleted = false
          existingLog.outcome = null
          urgeLog = existingLog
        } else {
          // 如果找不到，创建新的记录
          urgeLog = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            assignedIntervention: interventionType,
            isCompleted: false,
            outcome: null
          }
          urgeLogs.value.unshift(urgeLog)
        }
      } else {
        // 如果没有传入干预ID，创建新的记录
        urgeLog = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          assignedIntervention: interventionType,
          isCompleted: false,
          outcome: null
        }
        urgeLogs.value.unshift(urgeLog)
      }

      return urgeLog
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
      checkInRecords,
      currentInterventionType,
      isInIntervention,
      currentInterventionStartTime,
      todayCount,
      todayToolUsage,
      recentTasks,
      taskStats,
      activeTasks,
      expiredTasks,
      todayCheckInCount,
      todayDoWantCompletionRate,
      addTask,
      toggleTask,
      startIntervention,
      markInterventionCompleted,
      setTriggerReason,
      setCognitiveTag,
      completeIntervention,
      cancelIntervention,
      deleteTask,
      getTaskStats,
      getTaskCheckIns,
      getTodayCheckIns,
      hasCheckedInToday,
      isTaskExpired,
      isTaskActive,
      calculateTaskStatus,
      checkIn
    }
  },
  {
    persist: {
      key: 'self-discipline-app-store',
      paths: ['tasks', 'urgeLogs', 'checkInRecords']
    }
  }
)
