<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-medium text-calm-800 mb-4">每日打卡</h2>
      <p class="text-calm-600">{{ task?.name }}</p>
    </div>

    <!-- 任务状态信息 -->
    <div class="w-full max-w-md mb-8">
      <div class="card mb-4">
        <div class="flex items-center mb-3">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center mr-3"
            :class="taskTypeClass"
          >
            {{ taskTypeIcon }}
          </div>
          <div>
            <h3 class="font-medium text-calm-800">{{ task?.name }}</h3>
            <div class="text-xs text-calm-500">{{ formatDateRange }}</div>
          </div>
        </div>

        <!-- 状态标签 -->
        <div class="mb-4">
          <span class="px-3 py-1 rounded-full text-xs font-medium" :class="statusClass">
            {{ statusText }}
          </span>
        </div>

        <!-- 进度信息 -->
        <div class="space-y-3">
          <div v-if="taskStatus === 'ACTIVE'">
            <div class="flex justify-between text-sm text-calm-600 mb-1">
              <span>今日打卡状态</span>
              <span :class="todayCheckInStatusClass">{{ todayCheckInStatusText }}</span>
            </div>
            <div class="w-full bg-calm-100 rounded-full h-2">
              <div
                class="bg-green-500 h-2 rounded-full"
                :style="{ width: completionPercentage + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-calm-500 mt-1">
              <span>完成 {{ completedDays }}/{{ targetDays }} 天</span>
              <span>{{ completionPercentage }}%</span>
            </div>
          </div>

          <div
            v-if="taskStatus === 'EXPIRED' || taskStatus === 'COMPLETED' || taskStatus === 'FAILED'"
            class="text-center py-4"
          >
            <div class="text-4xl mb-3">{{ finalStatusIcon }}</div>
            <div class="text-lg font-medium mb-2">{{ finalStatusText }}</div>
            <div class="text-sm text-calm-500">
              完成 {{ completedDays }}/{{ targetDays }} 天 ({{ completionPercentage }}%)
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 打卡按钮 -->
    <div v-if="taskStatus === 'ACTIVE'" class="w-full max-w-md mb-8">
      <button
        @click="handleCheckIn"
        :disabled="hasCheckedInToday || isCheckingIn"
        class="w-full p-4 rounded-2xl text-center transition-all duration-200"
        :class="checkInButtonClass"
      >
        <div v-if="isCheckingIn" class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
          <span>打卡中...</span>
        </div>
        <div v-else>
          <div class="text-3xl mb-2">{{ checkInButtonIcon }}</div>
          <div class="text-lg font-medium mb-1">{{ checkInButtonText }}</div>
          <div class="text-sm opacity-80">{{ checkInButtonSubtext }}</div>
        </div>
      </button>
    </div>

    <!-- 历史记录 -->
    <div v-if="checkInHistory.length > 0" class="w-full max-w-md mb-8">
      <div class="card">
        <h3 class="font-medium text-calm-800 mb-3">最近打卡记录</h3>
        <div class="space-y-2">
          <div
            v-for="record in recentCheckIns"
            :key="record.id"
            class="flex items-center justify-between py-2 border-b border-calm-100 last:border-0"
          >
            <div class="flex items-center">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                :class="
                  record.isCompleted ? 'bg-green-100 text-green-800' : 'bg-calm-100 text-calm-800'
                "
              >
                {{ record.isCompleted ? '✓' : '✗' }}
              </div>
              <span class="text-sm text-calm-700">{{ formatRecordDate(record.timestamp) }}</span>
            </div>
            <span class="text-xs text-calm-500">{{ record.isCompleted ? '成功' : '失败' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回按钮 -->
    <div class="w-full max-w-md">
      <button
        @click="goBack"
        class="w-full p-4 rounded-2xl border-2 border-calm-200 bg-white text-calm-800 text-center transition-all duration-200 hover:border-calm-300 hover:bg-calm-50"
      >
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import type { Task } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useUrgeStore()

const taskId = ref<string>(route.params.taskId as string)
const task = ref<Task | undefined>()
const isCheckingIn = ref(false)

// 获取任务信息
onMounted(() => {
  task.value = store.tasks.find((t) => t.id === taskId.value)
})

// 计算属性：任务状态
const taskStatus = computed(() => {
  if (!task.value) return 'ACTIVE'
  return store.calculateTaskStatus(task.value)
})

// 计算属性：任务类型相关
const taskTypeIcon = computed(() => {
  return task.value?.type === 'DO_WANT' ? '💪' : '🚫'
})

const taskTypeClass = computed(() => {
  return task.value?.type === 'DO_WANT'
    ? 'bg-green-100 text-green-800'
    : 'bg-orange-100 text-orange-800'
})

// 计算属性：状态相关
const statusText = computed(() => {
  switch (taskStatus.value) {
    case 'ACTIVE':
      return '进行中'
    case 'EXPIRED':
      return '已过期'
    case 'COMPLETED':
      return '已完成'
    case 'FAILED':
      return '未完成'
    default:
      return '未知'
  }
})

const statusClass = computed(() => {
  switch (taskStatus.value) {
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-800'
    case 'EXPIRED':
      return 'bg-gray-100 text-gray-800'
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-calm-100 text-calm-800'
  }
})

// 计算属性：日期范围
const formatDateRange = computed(() => {
  if (!task.value) return ''

  const startDate = new Date(task.value.startDate)
  const endDate = new Date(task.value.endDate)

  return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`
})

// 计算属性：打卡相关
const hasCheckedInToday = computed(() => {
  if (!task.value) return false
  return store.hasCheckedInToday(task.value.id)
})

const checkInHistory = computed(() => {
  if (!task.value) return []
  return store.getTaskCheckIns(task.value.id)
})

const recentCheckIns = computed(() => {
  return checkInHistory.value.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
})

// 计算属性：进度相关
const totalDays = computed(() => {
  if (!task.value) return 0
  return Math.ceil((task.value.endDate - task.value.startDate) / (24 * 60 * 60 * 1000))
})

const targetDays = computed(() => {
  if (!task.value) return totalDays.value
  return task.value.targetCompletion || totalDays.value
})

const completedDays = computed(() => {
  if (!task.value) return 0
  return checkInHistory.value.filter((record) => record.isCompleted).length
})

const completionPercentage = computed(() => {
  if (targetDays.value === 0) return 0
  return Math.round((completedDays.value / targetDays.value) * 100)
})

// 计算属性：最终状态（过期后）
const finalStatusIcon = computed(() => {
  switch (taskStatus.value) {
    case 'COMPLETED':
      return '🎉'
    case 'FAILED':
      return '📝'
    case 'EXPIRED':
      return '⏰'
    default:
      return '❓'
  }
})

const finalStatusText = computed(() => {
  switch (taskStatus.value) {
    case 'COMPLETED':
      return '任务成功完成！'
    case 'FAILED':
      return '任务未完成'
    case 'EXPIRED':
      return '任务已过期'
    default:
      return '未知状态'
  }
})

// 计算属性：打卡按钮
const todayCheckInStatusText = computed(() => {
  return hasCheckedInToday.value ? '已打卡' : '未打卡'
})

const todayCheckInStatusClass = computed(() => {
  return hasCheckedInToday.value ? 'text-green-600' : 'text-calm-500'
})

const checkInButtonIcon = computed(() => {
  return hasCheckedInToday.value ? '✅' : '📅'
})

const checkInButtonText = computed(() => {
  return hasCheckedInToday.value ? '今日已打卡' : '立即打卡'
})

const checkInButtonSubtext = computed(() => {
  return hasCheckedInToday.value ? '明天再来吧' : '记录今天的努力'
})

const checkInButtonClass = computed(() => {
  if (hasCheckedInToday.value) {
    return 'bg-green-100 text-green-800 cursor-not-allowed'
  } else if (isCheckingIn.value) {
    return 'bg-blue-500 text-white'
  } else {
    return 'bg-green-500 text-white hover:bg-green-600'
  }
})

// 方法：处理打卡
const handleCheckIn = async () => {
  if (!task.value || hasCheckedInToday.value || isCheckingIn.value) return

  try {
    isCheckingIn.value = true
    await store.checkIn(task.value.id)

    // 显示成功提示
    setTimeout(() => {
      // 可以在这里添加成功动画或提示
    }, 300)
  } catch (error) {
    console.error('打卡失败:', error)
    // 可以在这里添加错误提示
  } finally {
    isCheckingIn.value = false
  }
}

// 方法：格式化日期
const formatRecordDate = (timestamp: number) => {
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
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 方法：返回首页
const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
/* 自定义样式 */
</style>
