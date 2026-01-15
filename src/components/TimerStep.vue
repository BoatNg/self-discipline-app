<template>
  <div class="flex flex-col items-center justify-center min-h-[400px]">
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
    <div class="max-w-sm text-center text-calm-500">
      <p class="mb-2">💭 冲动会像海浪一样过去</p>
      <p class="text-sm">不需要对抗它，只需要观察它的存在</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'

const router = useRouter()
const store = useUrgeStore()

const totalTime = 3 * 60 // 3分钟
const startTime = ref(Date.now())
const elapsedTime = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)

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

      // 标记干预完成并跳转到结果页面
      store.markInterventionCompleted()
      router.push('/result')
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
