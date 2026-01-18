export type InterventionType = 'TIMER' | 'BREATHE' | 'DUMP'
export type Outcome = 'resisted' | 'relapsed' | null

// 新增：任务类型枚举
export type TaskType = 'DONT_WANT' | 'DO_WANT' // "我不要" | "我想要"

// 新增：打卡周期类型
export type PeriodType = 'DAILY' | 'WEEKLY' | 'CUSTOM'

// 新增：任务状态
export type TaskStatus = 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'FAILED'

export interface UrgeLog {
  id: string
  timestamp: number
  assignedIntervention: InterventionType | null
  isCompleted: boolean
  outcome: Outcome
  triggerReason?: string
  cognitiveTag?: string // 认知卸载时选择的标签
  taskId?: string // 关联的任务ID
}

// 扩展：Task接口
export interface Task {
  id: string
  name: string
  type: TaskType // 新增：任务类型
  isEnabled: boolean
  startDate: number // 新增：开始时间戳
  endDate: number // 新增：结束时间戳
  periodType: PeriodType // 新增：打卡周期类型
  customDays?: number // 新增：自定义天数（仅当periodType='CUSTOM'时）
  targetCompletion?: number // 新增：目标完成次数
}

export interface TaskStats {
  taskId: string
  taskName: string
  associationCount: number
  resistedCount: number
  relapsedCount: number
  successRate: number
  lastAssociatedAt?: number
}

// 新增：打卡记录接口
export interface CheckInRecord {
  id: string
  taskId: string
  timestamp: number
  isCompleted: boolean // 是否打卡成功
  dateKey: string // 格式: 'YYYY-MM-DD'，用于去重判断
}

// 记录页升级相关类型
export type TaskDayStatus = 'SUCCESS' | 'FAILURE' | 'PENDING'

export interface TaskDayState {
  taskId: string
  dateKey: string // YYYY-MM-DD
  status: TaskDayStatus
}

export interface TaskProgress {
  taskId: string
  taskName: string
  taskType: TaskType
  streakDays: number // 最近连续天数
  isEnabled: boolean
}

export interface CalendarDayData {
  dateKey: string // YYYY-MM-DD
  date: Date
  isToday: boolean
  isPast: boolean
  taskStates: Record<string, TaskDayStatus> // taskId -> status
}

export interface CalendarViewData {
  days: CalendarDayData[]
  tasks: Task[]
}

export interface AppState {
  tasks: Task[]
  urgeLogs: UrgeLog[]
  checkInRecords: CheckInRecord[] // 新增：打卡记录
  currentInterventionType: InterventionType | null
  isInIntervention: boolean
  currentInterventionStartTime: number | null
}

// 云端同步相关类型
export interface CloudBackupData {
  tasks: Task[]
  urgeLogs: UrgeLog[]
  checkInRecords: CheckInRecord[]
  lastSyncAt?: number
}

export interface UserBackup {
  id: string
  user_id: string
  data: CloudBackupData
  updated_at: string
  created_at: string
}

export interface SyncConflictInfo {
  hasConflict: boolean
  remoteUpdatedAt?: Date
  localLastSyncTime?: Date | null
}
