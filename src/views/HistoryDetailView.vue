<template>
  <div>
    <!-- 选项卡 -->
    <div class="flex border-b border-calm-200 mb-6">
      <button
        @click="activeTab = 'urge'"
        :class="{
          'text-calm-800 border-b-2 border-calm-800': activeTab === 'urge',
          'text-calm-500 hover:text-calm-700': activeTab !== 'urge'
        }"
        class="flex-1 py-3 text-center font-medium transition-colors"
      >
        🚫 冲动记录
      </button>
      <button
        @click="activeTab = 'checkin'"
        :class="{
          'text-calm-800 border-b-2 border-calm-800': activeTab === 'checkin',
          'text-calm-500 hover:text-calm-700': activeTab !== 'checkin'
        }"
        class="flex-1 py-3 text-center font-medium transition-colors"
      >
        💪 打卡记录
      </button>
    </div>

    <!-- 冲动记录 -->
    <div v-if="activeTab === 'urge'">
      <div v-if="store.urgeLogs.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📝</div>
        <p class="text-calm-500">还没有冲动记录</p>
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
            <div class="text-sm text-calm-500 mt-1" style="max-width: 200px">
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

          <div class="flex items-center space-x-2">
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
            <button
              @click="deleteUrgeLog(log.id)"
              class="text-calm-400 hover:text-red-500 transition-colors"
              title="删除记录"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 打卡记录 -->
    <div v-if="activeTab === 'checkin'">
      <div v-if="store.checkInRecords.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📅</div>
        <p class="text-calm-500">还没有打卡记录</p>
        <p class="text-calm-400 text-sm mt-2">创建"我想要"任务并开始打卡</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="record in sortedCheckInRecords"
          :key="record.id"
          class="card flex items-center justify-between"
        >
          <div>
            <div class="font-medium text-calm-800">
              {{ formatDate(record.timestamp) }}
            </div>
            <div class="text-sm text-calm-500 mt-1">
              {{ getTaskName(record.taskId) }}
            </div>
            <div class="text-xs text-calm-400 mt-1">
              {{ getCheckInStatusText(record.isCompleted) }}
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div
              :class="{
                'bg-green-100 text-green-800': record.isCompleted,
                'bg-red-100 text-red-800': !record.isCompleted
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ record.isCompleted ? '成功' : '失败' }}
            </div>
            <!-- <button
              @click="deleteCheckInRecord(record.id)"
              class="text-calm-400 hover:text-red-500 transition-colors"
              title="删除记录"
            >
              ✕
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUrgeStore } from '@/stores/useUrgeStore'
import type { InterventionType } from '@/types'

const store = useUrgeStore()
const activeTab = ref<'urge' | 'checkin'>('urge')

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

const getInterventionText = (type: InterventionType | null) => {
  if (!type) return '未选择'

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

const getCheckInStatusText = (isCompleted: boolean) => {
  return isCompleted ? '打卡成功' : '打卡失败'
}

// 按时间倒序排列打卡记录
const sortedCheckInRecords = computed(() => {
  return [...store.checkInRecords].sort((a, b) => b.timestamp - a.timestamp)
})

const deleteUrgeLog = (id: string) => {
  store.deleteUrgeLog(id)
}

const deleteCheckInRecord = (id: string) => {
  store.deleteCheckInRecord(id)
}
</script>
