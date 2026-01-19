<template>
  <div class="flex flex-col items-center  min-h-[calc(100vh-160px)]">
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-medium text-calm-800 mb-4">我们一起等 3 分钟</h2>
      <p class="text-calm-600">什么都不用做，看着时间过去就好</p>
    </div>

    <!-- 倒计时圆圈 -->
    <div class="relative mb-8">
      <div class="w-64 h-64 rounded-full border-8 border-calm-200 flex items-center justify-center">
        <div class="text-center">
          <div class="text-5xl font-bold text-calm-800">{{ formattedTime }}</div>
          <div class="text-calm-500 mt-2">剩余时间</div>
        </div>
      </div>

      <!-- 进度环 -->
      <svg class="absolute inset-0 w-64 h-64 -rotate-90">
        <circle cx="128" cy="128" r="120" fill="none" stroke="#dcfce7" stroke-width="8" />
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="#4ade80"
          stroke-width="8"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <!-- 提示文字 -->
    <div class="mt-8 mb-4 max-w-sm text-center text-calm-500">
      <p class="mb-2">💭 冲动会像海浪一样过去</p>
      <p class="text-sm">不需要对抗它，只需要观察它的存在</p>
    </div>

    <!-- 跳过按钮（倒计时结束前显示） -->
    <button v-if="!isCompleted" @click="skipTimer" class="intervention-skip-btn">跳过等待</button>

    <!-- 完成按钮（倒计时结束后显示） -->
    <button v-if="isCompleted" @click="goToResult" class="btn-primary w-full max-w-md">完成</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'

const router = useRouter()
const store = useUrgeStore()

// 从父组件注入的方法
const getRouteParams = inject<() => any>('getRouteParams')

const totalTime = 3 * 60 // 3分钟
const startTime = ref(Date.now())
const elapsedTime = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)
const isCompleted = ref(false)

const timeLeft = computed(() => {
  return Math.max(0, totalTime - elapsedTime.value)
})

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const circumference = computed(() => 2 * Math.PI * 120)
const progressOffset = computed(() => {
  const progress = elapsedTime.value / totalTime
  return circumference.value * (1 - progress)
})

const updateElapsedTime = () => {
  elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
}

const startTimer = () => {
  updateElapsedTime()

  timer.value = setInterval(() => {
    updateElapsedTime()

    if (timeLeft.value <= 0) {
      clearInterval(timer.value!)

      // 提供物理反馈（如果设备支持）
      if ('vibrate' in navigator) {
        navigator.vibrate(200)
      }

      // 标记干预完成
      store.markInterventionCompleted()
      isCompleted.value = true
    }
  }, 100)
}

// 页面可见性变化处理
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // 页面重新可见时，更新已过去的时间
    updateElapsedTime()
  }
}

// 跳转到结果页面
const goToResult = () => {
  // 获取路由参数
  const routeParams = getRouteParams ? getRouteParams() : {}
  const taskIdFromRoute = routeParams.taskIdFromRoute
  const urgeLogId = routeParams.urgeLogId

  // 跳转到结果页面，传递任务ID和干预ID
  const query: Record<string, string> = {}
  if (taskIdFromRoute) query.taskId = taskIdFromRoute
  if (urgeLogId) query.urgeId = urgeLogId

  router.push({ path: '/result', query })
}

// 跳过等待
const skipTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
  }

  // 标记干预完成
  store.markInterventionCompleted()
  // 直接跳转到结果页
  goToResult()
}

onMounted(() => {
  startTimer()

  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }

  // 移除事件监听
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
