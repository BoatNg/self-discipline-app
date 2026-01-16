export type InterventionType = 'TIMER' | 'BREATHE' | 'DUMP'
export type Outcome = 'resisted' | 'relapsed' | null

export interface UrgeLog {
  id: string
  timestamp: number
  assignedIntervention: InterventionType
  isCompleted: boolean
  outcome: Outcome
  triggerReason?: string
  cognitiveTag?: string // 认知卸载时选择的标签
  taskId?: string // 关联的任务ID
}

export interface Task {
  id: string
  name: string
  isEnabled: boolean
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

export interface AppState {
  tasks: Task[]
  urgeLogs: UrgeLog[]
  currentInterventionType: InterventionType | null
  isInIntervention: boolean
  currentInterventionStartTime: number | null
}
