<template>
  <div class="behavior-calendar">
    <!-- 日历标题 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-calm-800 mb-2">行为日历</h2>
      <p class="text-calm-500 text-sm">查看每项任务在最近30天的状态</p>
    </div>

    <!-- 日历容器 -->
    <div class="overflow-x-auto">
      <!-- 日期头部 -->
      <div class="flex border-b border-calm-200 pb-2 min-w-fit">
        <div class="w-32 flex-shrink-0"></div>
        <!-- 任务名称列 -->
        <div
          v-for="day in calendarData.days"
          :key="day.dateKey"
          class="w-10 flex-shrink-0 text-center"
        >
          <div
            :class="{
              'font-bold text-calm-800': day.isToday,
              'text-calm-600': !day.isToday
            }"
            class="text-xs mb-1"
          >
            {{ formatDayHeader(day.date) }}
          </div>
          <div
            :class="{
              'text-calm-800 font-medium': day.isToday,
              'text-calm-500': !day.isToday
            }"
            class="text-sm"
          >
            {{ formatDateNumber(day.date) }}
          </div>
        </div>
      </div>

      <!-- 任务行 -->
      <div
        v-for="task in calendarData.tasks"
        :key="task.id"
        class="flex items-center border-b border-calm-100 py-3 min-w-fit hover:bg-calm-50/50 transition-colors"
      >
        <!-- 任务信息 -->
        <div class="w-32 flex-shrink-0 pr-3">
          <div class="flex items-center">
            <div
              :class="{
                'bg-purple-100 text-purple-800': task.type === 'DONT_WANT',
                'bg-blue-100 text-blue-800': task.type === 'DO_WANT'
              }"
              class="w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
            >
              <span v-if="task.type === 'DONT_WANT'">🚫</span>
              <span v-else>💪</span>
            </div>
            <div class="min-w-0">
              <div class="font-medium text-calm-800 truncate" :title="task.name">
                {{ task.name }}
              </div>
              <div class="text-xs text-calm-400 truncate">
                {{ getTaskTypeLabel(task.type) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 状态单元格 -->
        <div
          v-for="day in calendarData.days"
          :key="`${task.id}-${day.dateKey}`"
          class="w-10 flex-shrink-0 text-center"
        >
          <div
            v-if="day.taskStates[task.id]"
            :class="getStatusCellClass(day.taskStates[task.id], day.isToday)"
            class="w-8 h-8 rounded-md flex items-center justify-center mx-auto cursor-pointer"
            :title="getCellTooltip(task, day, day.taskStates[task.id])"
          >
            <span class="text-sm">
              {{ getStatusIcon(day.taskStates[task.id]) }}
            </span>
          </div>
          <div
            v-else
            class="w-8 h-8 rounded-md flex items-center justify-center mx-auto text-calm-300"
            :title="`${task.name} 在 ${formatDateDisplay(day.date)} 不在有效期内`"
          >
            <span class="text-sm">—</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="mt-6 pt-4 border-t border-calm-200">
      <div class="text-sm text-calm-500 mb-2">状态说明</div>
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center">
          <div
            class="w-6 h-6 bg-green-100 text-green-800 rounded-md flex items-center justify-center mr-2"
          >
            <span class="text-sm">🟢</span>
          </div>
          <span class="text-sm text-calm-600">成功</span>
        </div>
        <div class="flex items-center">
          <div
            class="w-6 h-6 bg-red-100 text-red-800 rounded-md flex items-center justify-center mr-2"
          >
            <span class="text-sm">🔴</span>
          </div>
          <span class="text-sm text-calm-600">失败</span>
        </div>
        <div class="flex items-center">
          <div
            class="w-6 h-6 bg-calm-100 text-calm-600 rounded-md flex items-center justify-center mr-2"
          >
            <span class="text-sm">⚪️</span>
          </div>
          <span class="text-sm text-calm-600">未知</span>
        </div>
        <div class="flex items-center">
          <div
            class="w-6 h-6 border border-calm-200 text-calm-300 rounded-md flex items-center justify-center mr-2"
          >
            <span class="text-sm">—</span>
          </div>
          <span class="text-sm text-calm-600">不在有效期</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskType, CalendarViewData } from '@/types'

interface Props {
  calendarData: CalendarViewData
}

defineProps<Props>()

const formatDayHeader = (date: Date) => {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return days[date.getDay()]
}

const formatDateNumber = (date: Date) => {
  return date.getDate()
}

const formatDateDisplay = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const getTaskTypeLabel = (type: TaskType) => {
  return type === 'DONT_WANT' ? '我不要' : '我想要'
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return '🟢'
    case 'FAILURE':
      return '🔴'
    case 'UNKNOWN':
      return '⚪️'
    default:
      return '❓'
  }
}

const getStatusCellClass = (status: string, isToday: boolean) => {
  const baseClasses = 'transition-all duration-200'

  switch (status) {
    case 'SUCCESS':
      return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200 ${isToday ? 'ring-2 ring-green-300' : ''}`
    case 'FAILURE':
      return `${baseClasses} bg-red-100 text-red-800 hover:bg-red-200 ${isToday ? 'ring-2 ring-red-300' : ''}`
    case 'UNKNOWN':
      return `${baseClasses} bg-calm-100 text-calm-600 hover:bg-calm-200 ${isToday ? 'ring-2 ring-calm-300' : ''}`
    default:
      return `${baseClasses} bg-gray-100 text-gray-500 hover:bg-gray-200`
  }
}

const getCellTooltip = (task: any, day: any, status: string) => {
  const dateStr = formatDateDisplay(day.date)
  const taskName = task.name
  const taskType = getTaskTypeLabel(task.type)

  switch (status) {
    case 'SUCCESS':
      if (task.type === 'DO_WANT') {
        return `${dateStr}: ${taskName} (${taskType})\n成功打卡`
      } else {
        return `${dateStr}: ${taskName} (${taskType})\n成功克制冲动`
      }
    case 'FAILURE':
      if (task.type === 'DO_WANT') {
        return `${dateStr}: ${taskName} (${taskType})\n未完成打卡`
      } else {
        return `${dateStr}: ${taskName} (${taskType})\n未克制住冲动`
      }
    case 'UNKNOWN':
      return `${dateStr}: ${taskName} (${taskType})\n无相关记录`
    default:
      return `${dateStr}: ${taskName} (${taskType})\n状态未知`
  }
}
</script>

<style scoped>
.behavior-calendar {
  -webkit-overflow-scrolling: touch;
}

/* 滚动条样式 */
.behavior-calendar ::-webkit-scrollbar {
  height: 8px;
}

.behavior-calendar ::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.behavior-calendar ::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.behavior-calendar ::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
