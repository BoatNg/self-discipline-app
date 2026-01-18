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
          getDateCellHeightClass(day),
          day.isToday ? 'ring-2 ring-calm-500 ring-offset-1' : '',
          day.isCurrentMonth ? 'cursor-pointer hover:shadow-sm transition-shadow' : 'cursor-default'
        ]"
        class="rounded-lg p-2 flex flex-col"
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
        <div
          v-if="day.isCurrentMonth && day.taskStatusDetails.length > 0"
          class="flex-1 overflow-y-auto"
        >
          <div class="space-y-1 truncate">
            <div
              v-for="taskDetail in day.taskStatusDetails"
              :key="taskDetail.taskId"
              :class="getTaskStatusColorClass(taskDetail.status)"
              class="task-name"
              :title="`${taskDetail.taskName}: ${getStatusText(taskDetail.status)}`"
            >
              {{ taskDetail.taskName }}
            </div>
          </div>
        </div>

        <!-- 无任务状态（空白） -->
        <div
          v-else-if="day.isCurrentMonth && day.taskStatusDetails.length === 0"
          class="flex-1"
        ></div>

        <!-- 非当月日期提示 -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-xs text-gray-400 italic">非当月</div>
        </div>
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
          <div class="text-green-600 text-xs font-medium mr-2">成功</div>
          <div>
            <div class="text-xs text-calm-600">任务完成</div>
            <div class="text-xs text-calm-400">绿色文字</div>
          </div>
        </div>
        <div class="flex items-center">
          <div class="text-red-600 text-xs font-medium mr-2">失败</div>
          <div>
            <div class="text-xs text-calm-600">任务未完成</div>
            <div class="text-xs text-calm-400">红色文字</div>
          </div>
        </div>
        <div class="flex items-center">
          <div class="text-gray-400 text-xs font-medium mr-2">未进行</div>
          <div>
            <div class="text-xs text-calm-600">今日或未来待完成</div>
            <div class="text-xs text-calm-400">灰色文字</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MonthViewData, MonthViewTaskStatus } from '@/utils/monthCalendar'
import { getTaskStatusColorClass } from '@/utils/monthCalendar'

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

// 获取日期单元格高度类（根据任务数量动态调整）
const getDateCellHeightClass = (day: any) => {
  const taskCount = day.taskStatusDetails.length

  if (taskCount === 0) return 'h-24'
  if (taskCount <= 3) return 'h-32'
  if (taskCount <= 6) return 'h-40'
  return 'h-48'
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
</script>

<style scoped>
.month-calendar {
  @apply select-none;
}

/* 任务名称8px字体（全局） */
.task-name {
  font-size: 8px;
  line-height: 10px;
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

  .h-24 {
    height: 6rem;
  }
  .h-32 {
    height: 8rem;
  }
  .h-40 {
    height: 10rem;
  }
  .h-48 {
    height: 12rem;
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

  /* 任务名称8px字体 */
  .task-name {
    font-size: 8px;
    line-height: 10px;
  }
}

@media (max-width: 375px) {
  .gap-2 {
    gap: 0.125rem;
  }

  .p-2 {
    padding: 0.25rem;
  }

  .text-xs {
    font-size: 0.5625rem;
    line-height: 0.75rem;
  }

  /* 任务名称8px字体 */
  .task-name {
    font-size: 8px;
    line-height: 10px;
  }
}
</style>
