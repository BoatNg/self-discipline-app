<template>
  <div class="history-overview">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-calm-800 mb-2">行为与任务进度总览</h1>
      <p class="text-calm-500">每周视角查看你的坚持轨迹，为每一天的努力鼓掌</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="space-y-8">
      <div class="card animate-pulse">
        <div class="h-6 bg-calm-200 rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-calm-200 rounded w-2/3 mb-6"></div>
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-12 bg-calm-100 rounded"></div>
        </div>
      </div>
      <div class="card animate-pulse">
        <div class="h-6 bg-calm-200 rounded w-1/3 mb-4"></div>
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="h-16 bg-calm-100 rounded"></div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="isEmpty" class="card text-center py-16">
      <div class="text-8xl mb-6">📊</div>
      <h2 class="text-xl font-bold text-calm-800 mb-3">还没有任务记录</h2>
      <p class="text-calm-500 mb-6 max-w-md mx-auto">
        创建"我想要"或"我不要"任务，开始你的自律之旅吧
      </p>
      <div class="flex justify-center gap-4">
        <router-link
          to="/task/create"
          class="px-6 py-3 bg-calm-800 text-white rounded-lg font-medium hover:bg-calm-900 transition-colors"
        >
          创建任务
        </router-link>
        <router-link
          to="/"
          class="px-6 py-3 bg-calm-100 text-calm-800 rounded-lg font-medium hover:bg-calm-200 transition-colors"
        >
          返回首页
        </router-link>
      </div>
    </div>

    <!-- 正常内容 -->
    <div v-else class="space-y-8">
      <!-- 月视图日历 -->
      <MonthCalendar
        :month-data="store.monthViewData"
        :month-text="store.currentMonthText"
        :year="store.monthViewData.year"
        @month-change="handleMonthChange"
        @date-click="handleDateClick"
        class="card max-w-none"
      />

      <!-- 任务连续进度 -->
      <TaskProgressList
        :task-progresses="store.taskProgresses"
        @task-click="handleTaskClick"
        class="card"
      />

      <!-- 统一详情入口 -->
      <div class="mt-10 pt-8 border-t border-calm-200">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-medium text-calm-800 mb-1">查看完整记录</h3>
            <p class="text-calm-500 text-sm">浏览所有冲动记录和打卡历史</p>
          </div>
          <router-link
            to="/history/detail"
            class="px-6 py-3 bg-calm-100 text-calm-800 rounded-lg font-medium hover:bg-calm-200 transition-colors whitespace-nowrap"
          >
            查看全部记录 →
          </router-link>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="mt-12 pt-8 border-t border-calm-200">
      <div class="text-sm text-calm-500">
        <p class="mb-2">连续天数计算说明：</p>
        <ul class="list-disc list-inside space-y-1">
          <li><strong>【我想要】任务</strong>：当天成功打卡记为成功日</li>
          <li><strong>【我不要】任务</strong>：当天无失败记录记为成功日</li>
          <li>遇到失败日时连续天数重新计算</li>
          <li>未知状态（无记录）不会中断连续天数</li>
          <li>连续天数用于鼓励坚持，而非制造压力</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUrgeStore } from '@/stores/useUrgeStore'
import MonthCalendar from '@/components/MonthCalendar.vue'
import TaskProgressList from '@/components/TaskProgressList.vue'

const store = useUrgeStore()
const isLoading = ref(true)

// 检查是否为空状态
const isEmpty = computed(() => {
  return (
    store.tasks.length === 0 && store.urgeLogs.length === 0 && store.checkInRecords.length === 0
  )
})

// 处理任务点击
const handleTaskClick = (taskId: string) => {
  // 可以在这里实现跳转到任务详情或相关记录
  console.log('点击任务:', taskId)
  // 暂时只记录，后续可以扩展功能
}

// 处理月导航
const handleMonthChange = (direction: 'previous' | 'next' | 'current') => {
  switch (direction) {
    case 'previous':
      store.goToPreviousMonth()
      break
    case 'next':
      store.goToNextMonth()
      break
    case 'current':
      store.goToCurrentMonth()
      break
  }
}

// 处理日期点击
const handleDateClick = (date: Date) => {
  console.log('点击日期:', date)
  // 可以在这里实现显示该日期的详细记录
}

// 模拟加载
onMounted(() => {
  // 数据计算需要时间，延迟显示加载完成
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})
</script>

<style scoped>
.history-overview {
  @apply pb-8 max-w-none;
}

.card {
  @apply bg-white rounded-xl p-6 border border-calm-200;
}

/* 平滑动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
