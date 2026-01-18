import type { Task, UrgeLog, CheckInRecord, TaskDayStatus } from '@/types'
import { generateDateKey, calculateTaskDayStatus } from './streakCalculator'

// 月视图使用的扩展状态类型
// 包含空白状态，用于表示日期不在任务周期内
export type MonthViewTaskStatus = TaskDayStatus | null

export interface MonthDayData {
  dateKey: string
  date: Date
  dayOfWeek: number
  dayOfWeekText: string
  dayNumber: number
  month: number
  isToday: boolean
  isPast: boolean
  isWeekend: boolean
  isCurrentMonth: boolean
  taskStatusDetails: Array<{
    taskId: string
    taskName: string
    status: MonthViewTaskStatus
  }>
  taskSummary: {
    successCount: number
    failureCount: number
    pendingCount: number
    activeTaskCount: number
  }
  taskStates: Record<string, MonthViewTaskStatus>
}

export interface MonthViewData {
  monthStartDate: Date
  monthEndDate: Date
  year: number
  month: number
  monthText: string
  days: MonthDayData[]
  tasks: Task[]
}

/**
 * 计算月视图中单个任务在某天的状态
 * 遵循v1.2.2规则：
 * 1. 日期是否在任务有效区间 [startDate, endDate]？否 → 空白(null)
 * 2. 是否有执行记录？是 → 根据记录显示成功/失败
 * 3. 无记录 → 按日期态判断：过去→失败，今天/未来→未进行
 */
function calculateMonthViewTaskStatus(
  task: Task,
  date: Date,
  urgeLogs: UrgeLog[],
  checkInRecords: CheckInRecord[],
  referenceDate: Date = new Date()
): MonthViewTaskStatus {
  // 使用streakCalculator中的calculateTaskDayStatus函数
  // 该函数已经实现了文档要求的规则
  return calculateTaskDayStatus(task, date, urgeLogs, checkInRecords, referenceDate)
}

/**
 * 获取月份第一天
 */
export function getMonthStartDate(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), 1)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 获取指定日期所在月的最后一天
 */
export function getMonthEndDate(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * 获取指定月的所有日期（包括上个月和下个月的部分日期，以填充完整网格）
 */
export function getMonthDates(monthStartDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(monthStartDate)

  // 移动到该月的第一天（需要调整到正确的星期几）
  const firstDayOfMonth = new Date(currentDate)
  const dayOfWeek = firstDayOfMonth.getDay() // 0-6 (0 = 周日)

  // 从该月第一天往前回溯到上周日
  const daysToSubtract = dayOfWeek
  firstDayOfMonth.setDate(firstDayOfMonth.getDate() - daysToSubtract)

  // 生成6周（42天）的日期，确保能完整显示任何月份
  for (let i = 0; i < 42; i++) {
    const date = new Date(firstDayOfMonth)
    dates.push(date)
    firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1)
  }

  return dates
}

/**
 * 获取星期几的中文文本
 */
function getDayOfWeekText(dayOfWeek: number): string {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return days[dayOfWeek] || '未知'
}

/**
 * 获取月份的中文文本
 */
export function getMonthText(month: number): string {
  const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月'
  ]
  return months[month - 1] || '未知月'
}

/**
 * 生成月视图数据
 */
export function generateMonthViewData(
  tasks: Task[],
  urgeLogs: UrgeLog[],
  checkInRecords: CheckInRecord[],
  referenceDate: Date = new Date()
): MonthViewData {
  const monthStartDate = getMonthStartDate(referenceDate)
  const monthEndDate = getMonthEndDate(referenceDate)
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth() + 1

  const dates = getMonthDates(monthStartDate)
  const now = Date.now()

  // 准备任务名称映射，避免在循环中重复查找
  const taskNameMap = new Map<string, string>()
  tasks.forEach((task) => {
    taskNameMap.set(task.id, task.name)
  })

  const days: MonthDayData[] = dates.map((date) => {
    const dateKey = generateDateKey(date)
    const dateTimestamp = date.getTime()
    const dayOfWeek = date.getDay()
    const isToday = dateKey === generateDateKey(new Date())
    const isPast = dateTimestamp < now
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // 判断是否属于当前月份
    const isCurrentMonth =
      date.getMonth() === referenceDate.getMonth() &&
      date.getFullYear() === referenceDate.getFullYear()

    // 计算每个任务的状态详情
    const taskStatusDetails: Array<{
      taskId: string
      taskName: string
      status: MonthViewTaskStatus
    }> = []

    let successCount = 0
    let failureCount = 0
    let pendingCount = 0
    let activeTaskCount = 0

    tasks.forEach((task) => {
      const status = calculateMonthViewTaskStatus(task, date, urgeLogs, checkInRecords)

      // 只记录非空白状态（status !== null）
      if (status !== null) {
        taskStatusDetails.push({
          taskId: task.id,
          taskName: task.name,
          status
        })

        // 统计计数（所有非空白状态都算活跃任务）
        activeTaskCount++
        switch (status) {
          case 'SUCCESS':
            successCount++
            break
          case 'FAILURE':
            failureCount++
            break
          case 'PENDING':
            pendingCount++
            break
        }
      }
      // 空白状态（status === null）不记录也不统计
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
      isCurrentMonth,
      taskStatusDetails,
      taskSummary: {
        successCount,
        failureCount,
        pendingCount,
        activeTaskCount
      },
      taskStates: taskStatusDetails.reduce(
        (acc, detail) => {
          acc[detail.taskId] = detail.status
          return acc
        },
        {} as Record<string, MonthViewTaskStatus>
      )
    }
  })

  // 过滤出活跃任务
  const activeTasks = tasks.filter((task) => task.isEnabled)

  return {
    monthStartDate,
    monthEndDate,
    year,
    month,
    monthText: getMonthText(month),
    days,
    tasks: activeTasks
  }
}

/**
 * 获取指定月的上一个月起始日期
 */
export function getPreviousMonthStart(currentMonthStart: Date): Date {
  const result = new Date(currentMonthStart)
  result.setMonth(result.getMonth() - 1)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 获取指定月的下一个月起始日期
 */
export function getNextMonthStart(currentMonthStart: Date): Date {
  const result = new Date(currentMonthStart)
  result.setMonth(result.getMonth() + 1)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 格式化月份显示文本
 */
export function formatMonthText(year: number, month: number): string {
  return `${year}年${getMonthText(month)}`
}

/**
 * 获取日期状态颜色类
 * 根据PRD要求：
 * - 所有任务成功：绿色边框
 * - 有失败/PENDING状态：红色警示
 */
export function getDateCellClass(dayData: MonthDayData): string {
  const { successCount, failureCount, pendingCount, activeTaskCount } = dayData.taskSummary

  if (!dayData.isCurrentMonth) {
    return 'opacity-40 bg-gray-50'
  }

  // 所有任务都成功
  if (activeTaskCount > 0 && successCount === activeTaskCount) {
    return 'border-2 border-green-400 bg-green-50/30'
  }

  // 有失败或PENDING状态的任务
  if (failureCount > 0 || pendingCount > 0) {
    return 'border border-red-300 bg-red-50/20'
  }

  // 默认状态（无任务或有任务但都是空白状态）
  return 'border border-gray-200'
}

/**
 * 获取任务状态颜色类
 */
export function getTaskStatusColorClass(status: MonthViewTaskStatus): string {
  switch (status) {
    case 'SUCCESS':
      return 'text-green-600 font-medium'
    case 'FAILURE':
      return 'text-red-600 font-medium'
    case 'PENDING':
      return 'text-gray-400'
    default:
      return 'text-gray-500' // 空白状态不应该调用此函数
  }
}

/**
 * 获取日期单元格高度类（根据任务数量动态调整）
 */
export function getDateCellHeightClass(dayData: MonthDayData): string {
  const taskCount = dayData.taskStatusDetails.length

  if (taskCount === 0) return 'h-24'
  if (taskCount <= 2) return 'h-28'
  if (taskCount <= 4) return 'h-32'
  return 'h-36'
}
