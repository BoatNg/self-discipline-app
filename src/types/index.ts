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
}

export interface Task {
  id: string
  name: string
  isEnabled: boolean
}

export interface AppState {
  tasks: Task[]
  urgeLogs: UrgeLog[]
  currentInterventionType: InterventionType | null
  isInIntervention: boolean
  currentInterventionStartTime: number | null
}
