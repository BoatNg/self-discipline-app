<template>
  <div class="flex flex-col items-center justify-center min-h-[400px]">
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-medium text-calm-800 mb-4">跟着呼吸</h2>
      <p class="text-calm-600">吸气时圆圈变大，呼气时圆圈变小</p>
    </div>

    <!-- 呼吸动画 -->
    <div class="relative mb-8">
      <div
        class="w-64 h-64 rounded-full bg-primary-100 breathe-circle flex items-center justify-center"
      >
        <div class="text-center">
          <div class="text-3xl font-medium text-primary-800 mb-2">{{ breathePhase }}</div>
          <div class="text-calm-600">呼吸中...</div>
        </div>
      </div>
    </div>

    <!-- 呼吸指示器 -->
    <div class="flex items-center space-x-4 mb-8">
      <div class="flex flex-col items-center">
        <div class="w-3 h-3 rounded-full bg-primary-500 mb-1"></div>
        <span class="text-xs text-calm-500">吸气</span>
      </div>
      <div class="flex flex-col items-center">
        <div class="w-3 h-3 rounded-full bg-calm-300 mb-1"></div>
        <span class="text-xs text-calm-500">屏息</span>
      </div>
      <div class="flex flex-col items-center">
        <div class="w-3 h-3 rounded-full bg-primary-400 mb-1"></div>
        <span class="text-xs text-calm-500">呼气</span>
      </div>
    </div>

    <!-- 提示文字 -->
    <div class="max-w-sm text-center text-calm-500">
      <p class="mb-2">🌬️ 关注你的呼吸</p>
      <p class="text-sm">不需要控制，只需要观察呼吸的自然节奏</p>
    </div>

    <!-- 跳过按钮 -->
    <button @click="nextStep" class="mt-8 btn-secondary">跳过呼吸练习</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'

const router = useRouter()
const store = useUrgeStore()

const breathePhase = ref('吸气')
const breatheTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const phaseTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const startBreathing = () => {
  // 8秒一个完整呼吸周期
  const phases = [
    { name: '吸气', duration: 3000 },
    { name: '屏息', duration: 1000 },
    { name: '呼气', duration: 4000 }
  ]

  let currentPhaseIndex = 0

  const updatePhase = () => {
    const phase = phases[currentPhaseIndex]
    breathePhase.value = phase.name

    phaseTimer.value = setTimeout(() => {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length
      updatePhase()
    }, phase.duration)
  }

  updatePhase()

  // 总时长60秒
  breatheTimer.value = setTimeout(() => {
    if (phaseTimer.value) {
      clearTimeout(phaseTimer.value)
    }
    // 标记干预完成并跳转到结果页面
    store.markInterventionCompleted()
    router.push('/result')
  }, 60000)
}

const nextStep = () => {
  if (breatheTimer.value) {
    clearTimeout(breatheTimer.value)
  }
  if (phaseTimer.value) {
    clearTimeout(phaseTimer.value)
  }
  // 标记干预完成并跳转到结果页面
  store.markInterventionCompleted()
  router.push('/result')
}

onMounted(() => {
  startBreathing()
})

onUnmounted(() => {
  if (breatheTimer.value) {
    clearTimeout(breatheTimer.value)
  }
  if (phaseTimer.value) {
    clearTimeout(phaseTimer.value)
  }
})
</script>

<style scoped>
.breathe-circle {
  animation: breathe-scale 8s ease-in-out infinite;
}

@keyframes breathe-scale {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.6);
  }
}
</style>
