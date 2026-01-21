<template>
  <div class="month-calendar w-full" style="padding: 0.8rem">
    <!-- 月导航栏 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <button
            @click="$emit('month-change', 'previous')"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-calm-100 text-calm-700 hover:bg-calm-200 transition-colors"
            title="上个月"
          >
            <span class="text-lg">←</span>
          </button>
          <button
            @click="$emit('month-change', 'current')"
            class="px-3 py-1.5 rounded-lg bg-calm-100 text-calm-700 hover:bg-calm-200 transition-colors text-sm"
            title="回到本月"
          >
            本月
          </button>
          <button
            @click="$emit('month-change', 'next')"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-calm-100 text-calm-700 hover:bg-calm-200 transition-colors"
            title="下个月"
          >
            <span class="text-lg">→</span>
          </button>
        </div>
        <div class="text-lg font-bold text-calm-800">
          {{ monthText }}
        </div>
        <div class="text-sm text-calm-500">{{ year }}年</div>
      </div>
      <p class="text-calm-500 text-sm">点击日期查看该天所有任务状态</p>
    </div>

    <!-- 星期头部 -->
    <div class="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
      <div
        v-for="dayName in ['日', '一', '二', '三', '四', '五', '六']"
        :key="dayName"
        class="text-center"
      >
        <div class="text-sm font-medium text-calm-700">
          {{ dayName }}
        </div>
      </div>
    </div>

    <!-- 月日历网格 -->
    <div class="grid grid-cols-7 gap-1 sm:gap-2">
      <div
        v-for="day in monthData.days"
        :key="day.dateKey"
        @click="$emit('date-click', day.date)"
        :class="[
          getDateCellClass(day),
          day.isToday ? 'ring-2 ring-calm-500 ring-offset-1' : '',
          day.isCurrentMonth ? 'cursor-pointer hover:shadow-sm transition-shadow' : 'cursor-default'
        ]"
        class="rounded-lg p-2 flex flex-col h-20 overflow-hidden"
      >
        <!-- 日期数字 -->
        <div class="flex justify-between items-start mb-1">
          <div class="flex items-center">
            <div
              :class="{
                'w-6 h-6 bg-calm-800 text-white': day.isToday,
                'text-calm-600': day.isCurrentMonth,
                'text-gray-400': !day.isCurrentMonth
              }"
              class="rounded-full flex items-center justify-center font-medium text-sm"
            >
              {{ day.dayNumber }}
            </div>
            <div v-if="!day.isCurrentMonth" class="text-xs text-gray-400 ml-1">
              {{ day.month }}月
            </div>
          </div>
        </div>

        <!-- 任务状态列表（移动端优化） -->
        <template v-if="day.isCurrentMonth">
          <div v-if="day.taskStatusDetails.length > 0" class="flex-1 overflow-y-auto max-h-14">
            <div class="flex flex-wrap items-center justify-center  gap-1 ">
              <div
                v-for="taskDetail in day.taskStatusDetails"
                :key="taskDetail.taskId"
                class="flex items-center justify-center"
                :title="`${taskDetail.taskName}: ${getStatusText(taskDetail.status)}`"
              >
                <div
                  class="w-2.5 h-2.5 rounded-full"
                  :class="getTaskStatusDotClass(taskDetail.status)"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="flex-1"></div>
        </template>
        <template v-else>
          <!-- 非当月日期提示 -->
          <div class="flex-1 flex items-center justify-center">
            <div class="text-xs text-gray-400 italic">非当月</div>
          </div>
        </template>
      </div>
    </div>

    <!-- 图例说明（移动端优化） -->
    <div class="mt-6 pt-4 border-t border-calm-200">
      <div class="text-sm text-calm-500 mb-3">每日状态说明</div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div class="flex items-center">
          <div
            class="w-5 h-5 rounded-full bg-calm-800 text-white flex items-center justify-center font-medium text-xs mr-2"
          >
            15
          </div>
          <div>
            <div class="text-xs text-calm-600">今天</div>
            <div class="text-xs text-calm-400">当前日期</div>
          </div>
        </div>
        <div class="flex items-center">
          <div class="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></div>
          <div>
            <div class="text-xs text-calm-600">成功</div>
            <div class="text-xs text-calm-400">任务完成</div>
          </div>
        </div>
        <div class="flex items-center">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></div>
          <div>
            <div class="text-xs text-calm-600">失败</div>
            <div class="text-xs text-calm-400">任务未完成</div>
          </div>
        </div>
        <div class="flex items-center">
          <div class="w-2.5 h-2.5 rounded-full bg-gray-400 mr-2"></div>
          <div>
            <div class="text-xs text-calm-600">未进行</div>
            <div class="text-xs text-calm-400">今日或未来待完成</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MonthViewData, MonthViewTaskStatus } from '@/utils/monthCalendar'

interface Props {
  monthData: MonthViewData
  monthText: string
  year: number
}

defineProps<Props>()

defineEmits<{
  'month-change': [direction: 'previous' | 'next' | 'current']
  'date-click': [date: Date]
}>()

// 获取日期单元格样式类
const getDateCellClass = (day: any) => {
  if (!day.isCurrentMonth) {
    return 'opacity-40 bg-gray-50'
  }

  // 默认状态
  return 'border border-gray-200 bg-white'
}

// 获取状态文本
const getStatusText = (status: MonthViewTaskStatus) => {
  switch (status) {
    case 'SUCCESS':
      return '成功'
    case 'FAILURE':
      return '失败'
    case 'PENDING':
      return '未进行'
    default:
      return '未知'
  }
}

// 获取任务状态对应的圆点样式类
const getTaskStatusDotClass = (status: MonthViewTaskStatus) => {
  switch (status) {
    case 'SUCCESS':
      return 'bg-green-500'
    case 'FAILURE':
      return 'bg-red-500'
    case 'PENDING':
      return 'bg-gray-400'
    default:
      return 'bg-gray-300' // 空白状态
  }
}
</script>

<style scoped>
.month-calendar {
  @apply select-none;
}

/* 任务圆点样式 */
.task-dot {
  min-width: 0.625rem;
  min-height: 0.625rem;
}

/* 日期单元格悬停效果 */
.border {
  @apply transition-colors duration-200;
}

.border:hover {
  @apply shadow-sm;
}

/* 任务状态列表滚动优化 */
.overflow-y-auto {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.overflow-y-auto::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 响应式调整 */
@media (max-width: 640px) {
  .grid-cols-7 {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .h-20 {
    height: 5rem;
  }

  .max-h-14 {
    max-height: 3.5rem;
  }

  .p-2 {
    padding: 0.375rem;
  }

  .text-xs {
    font-size: 0.625rem;
    line-height: 0.875rem;
  }

  .w-6 {
    width: 1.25rem;
  }

  .h-6 {
    height: 1.25rem;
  }

  /* 任务圆点响应式调整 */
  .task-dot {
    min-width: 0.5rem;
    min-height: 0.5rem;
  }
}

@media (max-width: 375px) {
  .gap-2 {
    gap: 0.125rem;
  }

  .h-20 {
    height: 4.5rem;
  }

  .max-h-14 {
    max-height: 3rem;
  }

  .p-2 {
    padding: 0.25rem;
  }

  .text-xs {
    font-size: 0.5625rem;
    line-height: 0.75rem;
  }

  /* 任务圆点小屏幕调整 */
  .task-dot {
    min-width: 0.4375rem;
    min-height: 0.4375rem;
  }
}
</style>
