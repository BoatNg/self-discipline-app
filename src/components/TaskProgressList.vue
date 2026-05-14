<template>
  <div class="task-progress-list">
    <!-- 标题 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-calm-800 mb-2">任务连续进度</h2>
      <p class="text-calm-500 text-sm">展示当前正在坚持的任务及其连续天数</p>
    </div>

    <!-- 进度列表 -->
    <div v-if="taskProgresses.length === 0" class="card text-center py-12">
      <div class="text-6xl mb-4">📊</div>
      <p class="text-calm-500">还没有活跃的任务</p>
      <p class="text-calm-400 text-sm mt-2">创建任务并开始坚持吧</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="progress in taskProgresses"
        :key="progress.taskId"
        class="card hover:bg-calm-50/50 transition-colors cursor-pointer"
        @click="$emit('task-click', progress.taskId)"
      >
        <div class="flex items-center justify-between">
          <!-- 任务信息 -->
          <div class="flex items-center flex-1 min-w-0">
            <!-- 任务类型图标 -->
            <div
              :class="{
                'bg-purple-100 text-purple-800': progress.taskType === 'DONT_WANT',
                'bg-blue-100 text-blue-800': progress.taskType === 'DO_WANT'
              }"
              class="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
            >
              <span class="text-lg">
                {{ progress.taskType === 'DONT_WANT' ? '🚫' : '💪' }}
              </span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center mb-1">
                <div class="font-medium text-calm-800 truncate" :title="progress.taskName">
                  {{ progress.taskName }}
                </div>
                <span
                  :class="{
                    'bg-purple-100 text-purple-800': progress.taskType === 'DONT_WANT',
                    'bg-blue-100 text-blue-800': progress.taskType === 'DO_WANT'
                  }"
                  class="text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                >
                  {{ getTaskTypeLabel(progress.taskType) }}
                </span>
              </div>
              <div class="text-sm text-calm-500">持续坚持中...</div>
            </div>
          </div>

          <!-- 连续天数 -->
          <div class="ml-4 flex-shrink-0">
            <div
              :class="getStreakBadgeClass(progress.streakDays)"
              class="px-4 py-2 rounded-lg text-center min-w-[70px]"
            >
              <div class="text-2xl font-bold">
                {{ progress.streakDays }}
              </div>
              <div class="text-xs opacity-80">天</div>
            </div>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="mt-4">
          <div class="flex justify-between text-xs text-calm-500 mb-1">
            <span>连续坚持</span>
            <span>{{ getStreakEncouragement(progress.streakDays) }}</span>
          </div>
          <div class="h-1.5 bg-calm-100 rounded-full overflow-hidden">
            <div
              :class="getProgressBarClass(progress.streakDays)"
              :style="{ width: getProgressWidth(progress.streakDays) }"
              class="h-full rounded-full transition-all duration-500"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 说明 -->
    <div class="mt-6 text-sm text-calm-500">
      <p>连续天数计算规则：</p>
      <ul class="list-disc list-inside mt-1 space-y-1">
        <li><span class="font-medium">【修】任务</span>：当天成功打卡记为成功日</li>
        <li><span class="font-medium">【克】任务</span>：当天无失败记录记为成功日</li>
        <li>遇到失败日时连续天数重新计算</li>
        <li>未知状态不会中断连续天数</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskProgress } from '@/types'

interface Props {
  taskProgresses: TaskProgress[]
}

defineProps<Props>()

defineEmits<{
  'task-click': [taskId: string]
}>()

const getTaskTypeLabel = (type: string) => {
  return type === 'DONT_WANT' ? '克' : '修'
}

const getStreakBadgeClass = (streakDays: number) => {
  if (streakDays >= 30) {
    return 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200'
  } else if (streakDays >= 7) {
    return 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 border border-green-200'
  } else if (streakDays >= 3) {
    return 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border border-blue-200'
  } else {
    return 'bg-gradient-to-br from-calm-50 to-calm-100 text-calm-800 border border-calm-200'
  }
}

const getProgressBarClass = (streakDays: number) => {
  if (streakDays >= 30) {
    return 'bg-gradient-to-r from-yellow-400 to-yellow-500'
  } else if (streakDays >= 7) {
    return 'bg-gradient-to-r from-green-400 to-green-500'
  } else if (streakDays >= 3) {
    return 'bg-gradient-to-r from-blue-400 to-blue-500'
  } else {
    return 'bg-gradient-to-r from-calm-400 to-calm-500'
  }
}

const getProgressWidth = (streakDays: number) => {
  // 根据连续天数计算进度条宽度
  const maxDays = 100 // 最大参考值
  const percentage = Math.min((streakDays / maxDays) * 100, 100)
  return `${percentage}%`
}

const getStreakEncouragement = (streakDays: number) => {
  if (streakDays === 0) {
    return '刚开始，加油！'
  } else if (streakDays < 3) {
    return '很棒的开始！'
  } else if (streakDays < 7) {
    return '坚持得不错！'
  } else if (streakDays < 30) {
    return '太厉害了！'
  } else {
    return '惊人的坚持！'
  }
}
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl p-4 border border-calm-200;
}

/* 进度条动画 */
@keyframes progress-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

.hover\:bg-calm-50\/50:hover .progress-bar {
  animation: progress-pulse 1.5s ease-in-out infinite;
}
</style>
