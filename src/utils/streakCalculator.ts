import type { Task, TaskType, UrgeLog, CheckInRecord, TaskDayStatus } from '@/types'
import { getTimeState } from './timeState'

/**
 * 生成日期键（YYYY-MM-DD格式）
 */
export function generateDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取指定日期的开始时间戳（本地时间）
 * 统一使用本地时间处理，与时区无关
 */
export function getDayStartTimestamp(date: Date): number {
  const dateCopy = new Date(date)
  dateCopy.setHours(0, 0, 0, 0)
  return dateCopy.getTime()
}

/**
 * 获取指定日期的结束时间戳（本地时间）
 * 统一使用本地时间处理，与时区无关
 */
export function getDayEndTimestamp(date: Date): number {
  const dateCopy = new Date(date)
  dateCopy.setHours(23, 59, 59, 999)
  return dateCopy.getTime()
}

// 扩展状态类型，包含空白情况
export type TaskDayStatusWithBlank = TaskDayStatus | null

/**
 * 计算单个任务在某天的状态
 * 遵循v1.2.2规则：
 * 1. 日期是否在任务有效区间 [startDate, endDate]？否 → 空白
 * 2. 是否有执行记录？是 → 根据记录显示成功/失败
 * 3. 无记录 → 按日期态判断：过去→失败，今天/未来→未进行
 */
export function calculateTaskDayStatus(
  task: Task,
  date: Date,
  urgeLogs: UrgeLog[],
  checkInRecords: CheckInRecord[],
  referenceDate: Date = new Date()
): TaskDayStatusWithBlank {
  const dateTimestamp = getDayStartTimestamp(date)
  const dayStart = getDayStartTimestamp(date)
  const dayEnd = getDayEndTimestamp(date)

  // Step 0: 是否在任务有效区间内？
  if (dateTimestamp < task.startDate || dateTimestamp > task.endDate) {
    // 不在有效区间内，返回null表示空白
    return null
  }

  // Step 1: 检查是否有执行记录
  if (task.type === 'DO_WANT') {
    // 【我想要】任务：检查打卡记录
    const hasSuccessfulCheckIn = checkInRecords.some(
      (record) =>
        record.taskId === task.id &&
        record.isCompleted &&
        record.timestamp >= dayStart &&
        record.timestamp <= dayEnd
    )

    if (hasSuccessfulCheckIn) {
      return 'SUCCESS'
    } else {
      // 有记录但未成功，检查是否有失败记录
      const hasFailedCheckIn = checkInRecords.some(
        (record) =>
          record.taskId === task.id &&
          !record.isCompleted &&
          record.timestamp >= dayStart &&
          record.timestamp <= dayEnd
      )
      if (hasFailedCheckIn) {
        return 'FAILURE'
      }
    }
  } else {
    // 【我不要】任务：检查冲动记录
    const dayUrgeLogs = urgeLogs.filter(
      (log) =>
        log.taskId === task.id &&
        log.isCompleted &&
        log.timestamp >= dayStart &&
        log.timestamp <= dayEnd
    )

    if (dayUrgeLogs.length > 0) {
      const hasRelapse = dayUrgeLogs.some((log) => log.outcome === 'relapsed')
      return hasRelapse ? 'FAILURE' : 'SUCCESS'
    }
  }

  // Step 2: 无执行记录 → 按日期态判断
  const timeState = getTimeState(date, referenceDate)

  if (timeState === 'PAST') {
    return 'FAILURE' // 过去无记录：系统判定失败
  }

  return 'PENDING' // 今天或未来：未进行
}

/**
 * 计算任务的连续天数
 * 从指定日期向前回溯，遇到首个失败日停止
 * PENDING日不中断连续（但也不算入连续天数）
 */
export function calculateTaskStreak(
  task: Task,
  referenceDate: Date,
  urgeLogs: UrgeLog[],
  checkInRecords: CheckInRecord[]
): number {
  let streak = 0
  let currentDate = new Date(referenceDate)

  // 确保从当前日期的00:00:00开始
  currentDate.setHours(0, 0, 0, 0)

  // 向前回溯计算连续天数
  while (true) {
    // 检查当前日期是否在任务有效期内
    const dateTimestamp = getDayStartTimestamp(currentDate)
    if (dateTimestamp < task.startDate || dateTimestamp > task.endDate) {
      // 不在有效期内，停止计算
      break
    }

    const status = calculateTaskDayStatus(
      task,
      currentDate,
      urgeLogs,
      checkInRecords,
      referenceDate
    )

    if (status === 'SUCCESS') {
      streak++
    } else if (status === 'FAILURE') {
      break
    } else if (status === 'PENDING') {
      // PENDING日不算入连续天数，但也不中断
      // 继续检查前一天
    } else {
      // 其他状态（如空白），停止计算
      break
    }

    // 移动到前一天
    currentDate.setDate(currentDate.getDate() - 1)

    // 安全检查：防止无限循环
    if (streak > 365 * 10) {
      // 最多检查10年
      break
    }
  }

  return streak
}

/**
 * 获取指定日期范围内的所有日期
 */
export function getDateRange(startDate: Date, daysCount: number): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)

  for (let i = 0; i < daysCount; i++) {
    const date = new Date(currentDate)
    dates.push(date)
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return dates.reverse() // 返回从过去到现在的顺序
}

/**
 * 生成日历数据
 */
export function generateCalendarData(
  tasks: Task[],
  urgeLogs: UrgeLog[],
  checkInRecords: CheckInRecord[],
  daysCount: number = 30
): {
  days: Array<{
    dateKey: string
    date: Date
    isToday: boolean
    isPast: boolean
    taskStates: Record<string, TaskDayStatus> // taskId -> status (只包含非空白状态)
  }>
  tasks: Task[]
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dates = getDateRange(today, daysCount)
  const now = Date.now()

  const days = dates.map((date) => {
    const dateKey = generateDateKey(date)
    const dateTimestamp = date.getTime()
    const isToday = dateKey === generateDateKey(new Date())
    const isPast = dateTimestamp < now

    const taskStates: Record<string, TaskDayStatus> = {}

    tasks.forEach((task) => {
      const status = calculateTaskDayStatus(task, date, urgeLogs, checkInRecords, today)
      // 只记录非空白状态
      if (status !== null) {
        taskStates[task.id] = status
      }
    })

    return {
      dateKey,
      date,
      isToday,
      isPast,
      taskStates
    }
  })

  return { days, tasks }
}

/**
 * 获取所有任务的进度数据
 */
export function getTaskProgresses(
  tasks: Task[],
  urgeLogs: UrgeLog[],
  checkInRecords: CheckInRecord[],
  referenceDate: Date = new Date()
): {
  taskId: string
  taskName: string
  taskType: TaskType
  streakDays: number
  isEnabled: boolean
}[] {
  return tasks
    .filter((task) => task.isEnabled)
    .map((task) => {
      const streak = calculateTaskStreak(task, referenceDate, urgeLogs, checkInRecords)

      return {
        taskId: task.id,
        taskName: task.name,
        taskType: task.type,
        streakDays: streak,
        isEnabled: task.isEnabled
      }
    })
    .sort((a, b) => b.streakDays - a.streakDays) // 按连续天数降序排序
}
