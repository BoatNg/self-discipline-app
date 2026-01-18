<template>
  <div class="week-calendar">
    <!-- 周导航栏 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <button
            @click="$emit('week-change', 'previous')"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-calm-100 text-calm-700 hover:bg-calm-200 transition-colors"
            title="上一周"
          >
            <span class="text-lg">←</span>
          </button>
          <button
            @click="$emit('week-change', 'current')"
            class="px-3 py-1.5 rounded-lg bg-calm-100 text-calm-700 hover:bg-calm-200 transition-colors text-sm"
            title="回到本周"
          >
            本周
          </button>
          <button
            @click="$emit('week-change', 'next')"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-calm-100 text-calm-700 hover:bg-calm-200 transition-colors"
            title="下一周"
          >
            <span class="text-lg">→</span>
          </button>
        </div>
        <div class="text-lg font-bold text-calm-800">
          {{ weekRangeText }}
        </div>
        <div class="text-sm text-calm-500">第{{ weekNumber }}周</div>
      </div>
      <p class="text-calm-500 text-sm">点击日期查看该天所有任务状态</p>
    </div>

    <!-- 周日历网格 -->
    <div class="grid grid-cols-7 gap-2">
      <!-- 星期头部 -->
      <div v-for="day in weekData.days" :key="`header-${day.dateKey}`" class="text-center pb-2">
        <div
          :class="{
            'text-calm-800 font-bold': day.isToday,
            'text-red-600': day.isWeekend,
            'text-calm-600': !day.isToday && !day.isWeekend
          }"
          class="text-sm"
        >
          {{ day.dayOfWeekText }}
        </div>
      </div>

      <!-- 日期单元格 -->
      <div
        v-for="day in weekData.days"
        :key="day.dateKey"
        @click="$emit('date-click', day.date)"
        :class="{
          'bg-calm-50 border-calm-300': day.isToday,
          'bg-white border-calm-200': !day.isToday,
          'hover:bg-calm-50/80': !day.isPast,
          'opacity-90': day.isPast
        }"
        class="border rounded-xl p-3 min-h-[120px] flex flex-col cursor-pointer transition-all duration-200"
      >
        <!-- 日期数字 -->
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center">
            <div
              :class="{
                'w-8 h-8 bg-calm-800 text-white': day.isToday,
                'text-calm-700': !day.isToday && day.isWeekend,
                'text-calm-600': !day.isToday && !day.isWeekend
              }"
              class="rounded-full flex items-center justify-center font-bold text-lg"
            >
              {{ day.dayNumber }}
            </div>
            <div v-if="day.month !== getReferenceMonth()" class="text-xs text-calm-400 ml-1">
              {{ day.month }}月
            </div>
          </div>
          <div v-if="day.isWeekend" class="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
            周末
          </div>
        </div>

        <!-- 任务状态摘要 -->
        <div v-if="day.taskSummary.activeTaskCount > 0" class="flex-1">
          <!-- 状态图标统计 -->
          <div class="space-y-1.5">
            <div v-if="day.taskSummary.successCount > 0" class="flex items-center justify-between">
              <div class="flex items-center">
                <div
                  class="w-4 h-4 bg-green-100 text-green-800 rounded flex items-center justify-center mr-1.5"
                >
                  <span class="text-xs">✅</span>
                </div>
                <span class="text-xs text-calm-600">成功</span>
              </div>
              <span class="text-xs font-medium text-calm-800">
                {{ day.taskSummary.successCount }}
              </span>
            </div>
            <div v-if="day.taskSummary.failureCount > 0" class="flex items-center justify-between">
              <div class="flex items-center">
                <div
                  class="w-4 h-4 bg-red-100 text-red-800 rounded flex items-center justify-center mr-1.5"
                >
                  <span class="text-xs">🔴</span>
                </div>
                <span class="text-xs text-calm-600">失败</span>
              </div>
              <span class="text-xs font-medium text-calm-800">
                {{ day.taskSummary.failureCount }}
              </span>
            </div>
            <div v-if="day.taskSummary.unknownCount > 0" class="flex items-center justify-between">
              <div class="flex items-center">
                <div
                  class="w-4 h-4 bg-calm-100 text-calm-600 rounded flex items-center justify-center mr-1.5"
                >
                  <span class="text-xs">⚪️</span>
                </div>
                <span class="text-xs text-calm-600">未知</span>
              </div>
              <span class="text-xs font-medium text-calm-800">
                {{ day.taskSummary.unknownCount }}
              </span>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="mt-3">
            <div class="flex justify-between mb-0.5">
              <span class="text-xs text-calm-500">完成率</span>
              <span class="text-xs font-medium text-calm-700">
                {{ calculateCompletionRate(day) }}%
              </span>
            </div>
            <div class="h-1.5 bg-calm-100 rounded-full overflow-hidden">
              <div
                :style="{ width: calculateCompletionRate(day) + '%' }"
                :class="getCompletionRateClass(day)"
                class="h-full rounded-full transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="text-2xl text-calm-300 mb-1">📅</div>
            <div class="text-xs text-calm-400">无任务</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例说明 -->
    <div class="mt-6 pt-4 border-t border-calm-200">
      <div class="text-sm text-calm-500 mb-3">每日状态说明</div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="flex items-center">
          <div
            class="w-8 h-8 rounded-full bg-calm-800 text-white flex items-center justify-center font-bold text-sm mr-2"
          >
            15
          </div>
          <div>
            <div class="text-xs text-calm-600">今天</div>
            <div class="text-xs text-calm-400">当前日期</div>
          </div>
        </div>
        <div class="flex items-center">
          <div
            class="w-4 h-4 bg-green-100 text-green-800 rounded flex items-center justify-center mr-2"
          >
            <span class="text-xs">✅</span>
          </div>
          <div>
            <div class="text-xs text-calm-600">成功</div>
            <div class="text-xs text-calm-400">完成目标</div>
          </div>
        </div>
        <div class="flex items-center">
          <div
            class="w-4 h-4 bg-red-100 text-red-800 rounded flex items-center justify-center mr-2"
          >
            <span class="text-xs">🔴</span>
          </div>
          <div>
            <div class="text-xs text-calm-600">失败</div>
            <div class="text-xs text-calm-400">未完成</div>
          </div>
        </div>
        <div class="flex items-center">
          <div
            class="w-4 h-4 bg-calm-100 text-calm-600 rounded flex items-center justify-center mr-2"
          >
            <span class="text-xs">⚪️</span>
          </div>
          <div>
            <div class="text-xs text-calm-600">未知</div>
            <div class="text-xs text-calm-400">无记录</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeekViewData } from '@/utils/weekCalendar'

interface Props {
  weekData: WeekViewData
  weekRangeText: string
  weekNumber: number
}

const props = defineProps<Props>()

defineEmits<{
  'week-change': [direction: 'previous' | 'next' | 'current']
  'date-click': [date: Date]
}>()

// 获取参考月份（通常是本周第一天所在的月份）
const getReferenceMonth = () => {
  return props.weekData.days[0].month
}

// 计算完成率
const calculateCompletionRate = (day: any) => {
  const { successCount, activeTaskCount } = day.taskSummary
  if (activeTaskCount === 0) return 0
  return Math.round((successCount / activeTaskCount) * 100)
}

// 获取完成率颜色类
const getCompletionRateClass = (day: any) => {
  const rate = calculateCompletionRate(day)
  if (rate >= 80) return 'bg-gradient-to-r from-green-400 to-green-500'
  if (rate >= 50) return 'bg-gradient-to-r from-blue-400 to-blue-500'
  if (rate > 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-500'
  return 'bg-gradient-to-r from-red-400 to-red-500'
}
</script>

<style scoped>
.week-calendar {
  @apply select-none;
}

/* 日期单元格悬停效果 */
.border {
  @apply transition-colors duration-200;
}

.border:hover {
  @apply border-calm-300 shadow-sm;
}

/* 进度条动画 */
.h-full {
  transition: width 0.6s ease-out;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .grid-cols-7 {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .min-h-\[120px\] {
    min-height: 100px;
  }

  .p-3 {
    padding: 0.5rem;
  }
}
</style>
