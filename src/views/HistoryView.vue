<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-calm-800 mb-4">冲动记录</h2>

      <div v-if="store.urgeLogs.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📝</div>
        <p class="text-calm-500">还没有记录</p>
        <p class="text-calm-400 text-sm mt-2">点击首页按钮开始第一次干预</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="log in store.urgeLogs"
          :key="log.id"
          class="card flex items-center justify-between"
        >
          <div>
            <div class="font-medium text-calm-800">
              {{ formatDate(log.timestamp) }}
            </div>
            <div class="text-sm text-calm-500 mt-1">
              {{ getInterventionText(log.assignedIntervention) }}
              {{
                log.cognitiveTag
                  ? `· ${log.cognitiveTag}`
                  : log.triggerReason
                    ? `· ${log.triggerReason}`
                    : ''
              }}
            </div>
            <!-- 任务关联显示 -->
            <div v-if="getTaskName(log.taskId)" class="text-xs text-calm-400 mt-1">
              📌 {{ getTaskName(log.taskId) }}
            </div>
          </div>

          <div class="flex items-center">
            <div
              :class="{
                'bg-green-100 text-green-800': log.isCompleted && log.outcome === 'resisted',
                'bg-calm-100 text-calm-800': log.isCompleted && log.outcome === 'relapsed',
                'bg-yellow-100 text-yellow-800': log.isCompleted && log.outcome === null,
                'bg-gray-100 text-gray-800': !log.isCompleted
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ getOutcomeText(log.isCompleted, log.outcome) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUrgeStore } from '@/stores/useUrgeStore'
import type { InterventionType } from '@/types'

const store = useUrgeStore()

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date >= today) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (date >= yesterday) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
}

const getInterventionText = (type: InterventionType) => {
  const interventionMap: Record<InterventionType, string> = {
    TIMER: '⏰ 3分钟等待',
    BREATHE: '🌬️ 呼吸练习',
    DUMP: '🧠 认知卸载'
  }
  return interventionMap[type]
}

const getOutcomeText = (isCompleted: boolean, outcome: 'resisted' | 'relapsed' | null) => {
  if (!isCompleted) {
    return '未完成'
  }

  switch (outcome) {
    case 'resisted':
      return '扛住了'
    case 'relapsed':
      return '没扛住'
    default:
      return '未记录'
  }
}

const getTaskName = (taskId: string | undefined) => {
  if (!taskId || taskId === '') {
    return null
  }

  const task = store.tasks.find((t) => t.id === taskId)
  if (!task) {
    return '已删除的任务'
  }

  return task.name
}
</script>
