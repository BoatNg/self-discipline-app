import type { Task, UrgeLog, CheckInRecord, TaskDayStatus } from '@/types'
import { generateDateKey, calculateTaskDayStatus } from './streakCalculator'

export interface WeekDayData {
  dateKey: string
  date: Date
  dayOfWeek: number // 0-6 (0 = 周日)
  dayOfWeekText: string
  dayNumber: number
  month: number
  isToday: boolean
  isPast: boolean
  isWeekend: boolean
  taskStates: Record<string, TaskDayStatus> // taskId -> status
  taskSummary: {
    successCount: number
    failureCount: number
    unknownCount: number
    activeTaskCount: number
  }
}

export interface WeekViewData {
  weekStartDate: Date
  weekEndDate: Date
  weekNumber: number
  year: number
  days: WeekDayData[]
  tasks: Task[]
}

/**
 * 获取指定日期所在周的起始日期（周日为第一天）
 */
export function getWeekStartDate(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay() // 0-6 (0 = 周日)
  result.setDate(result.getDate() - day)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 获取指定日期所在周的结束日期（周六为最后一天）
 */
export function getWeekEndDate(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay() // 0-6 (0 = 周日)
  result.setDate(result.getDate() + (6 - day))
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * 获取周数（ISO周数，1-53）
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7 // 将周日从0改为7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum) // 设置到该周的周四
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return weekNo
}

/**
 * 获取指定周的7天日期范围
 */
export function getWeekDates(weekStartDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(weekStartDate)

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate)
    dates.push(date)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

/**
 * 获取星期几的中文文本
 */
export function getDayOfWeekText(dayOfWeek: number): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[dayOfWeek] || '未知'
}

/**
 * 生成周视图数据
 */
export function generateWeekViewData(
  tasks: Task[],
  urgeLogs: UrgeLog[],
  checkInRecords: CheckInRecord[],
  referenceDate: Date = new Date()
): WeekViewData {
  const weekStartDate = getWeekStartDate(referenceDate)
  const weekEndDate = getWeekEndDate(referenceDate)
  const weekNumber = getWeekNumber(referenceDate)
  const year = referenceDate.getFullYear()

  const dates = getWeekDates(weekStartDate)
  const now = Date.now()

  const days: WeekDayData[] = dates.map((date) => {
    const dateKey = generateDateKey(date)
    const dateTimestamp = date.getTime()
    const dayOfWeek = date.getDay()
    const isToday = dateKey === generateDateKey(new Date())
    const isPast = dateTimestamp < now
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // 计算每个任务的状态
    const taskStates: Record<string, TaskDayStatus> = {}
    let successCount = 0
    let failureCount = 0
    let unknownCount = 0
    let activeTaskCount = 0

    tasks.forEach((task) => {
      // 只计算在任务有效期内的状态
      if (dateTimestamp >= task.startDate && dateTimestamp <= task.endDate && task.isEnabled) {
        activeTaskCount++
        const status = calculateTaskDayStatus(task, date, urgeLogs, checkInRecords)
        // 只记录非空白状态
        if (status !== null) {
          taskStates[task.id] = status

          switch (status) {
            case 'SUCCESS':
              successCount++
              break
            case 'FAILURE':
              failureCount++
              break
            case 'PENDING':
              unknownCount++ // 保持相同的计数器名称以便向后兼容
              break
          }
        } else {
          // 空白状态，不算入活跃任务
          activeTaskCount--
        }
      }
    })

    return {
      dateKey,
      date,
      dayOfWeek,
      dayOfWeekText: getDayOfWeekText(dayOfWeek),
      dayNumber: date.getDate(),
      month: date.getMonth() + 1,
      isToday,
      isPast,
      isWeekend,
      taskStates,
      taskSummary: {
        successCount,
        failureCount,
        unknownCount,
        activeTaskCount
      }
    }
  })

  // 过滤出活跃任务
  const activeTasks = tasks.filter((task) => task.isEnabled)

  return {
    weekStartDate,
    weekEndDate,
    weekNumber,
    year,
    days,
    tasks: activeTasks
  }
}

/**
 * 获取指定周的上一周起始日期
 */
export function getPreviousWeekStart(currentWeekStart: Date): Date {
  const result = new Date(currentWeekStart)
  result.setDate(result.getDate() - 7)
  return result
}

/**
 * 获取指定周的下一周起始日期
 */
export function getNextWeekStart(currentWeekStart: Date): Date {
  const result = new Date(currentWeekStart)
  result.setDate(result.getDate() + 7)
  return result
}

/**
 * 格式化周范围显示文本
 */
export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const startMonth = weekStart.getMonth() + 1
  const startDay = weekStart.getDate()
  const endMonth = weekEnd.getMonth() + 1
  const endDay = weekEnd.getDate()

  if (startMonth === endMonth) {
    return `${startMonth}月${startDay}日 - ${endDay}日`
  } else {
    return `${startMonth}月${startDay}日 - ${endMonth}月${endDay}日`
  }
}

/**
 * 获取日期状态摘要文本
 */
export function getDayStatusSummary(dayData: WeekDayData): string {
  const { successCount, failureCount, unknownCount, activeTaskCount } = dayData.taskSummary

  if (activeTaskCount === 0) {
    return '无任务'
  }

  const parts: string[] = []
  if (successCount > 0) parts.push(`✅${successCount}`)
  if (failureCount > 0) parts.push(`🔴${failureCount}`)
  if (unknownCount > 0) parts.push(`⚪️${unknownCount}`)

  return parts.join(' ') || '无记录'
}
