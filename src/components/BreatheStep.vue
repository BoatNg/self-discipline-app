<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 py-6">
    <!-- 标题区域 -->
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-semibold text-calm-800 mb-2 tracking-wide">跟着呼吸</h2>
      <p class="text-calm-500">专注当下，感受呼吸节奏</p>
    </div>

    <!-- 呼吸阶段显示 -->
    <div class="relative w-full max-w-md mb-8">
      <!-- 背景装饰 -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-calm-50 to-primary-50 rounded-3xl -z-10 opacity-60"
      ></div>

      <!-- 阶段显示 -->
      <div class="text-center py-10 px-6">
        <!-- Emoji显示 - 使用快速过渡 -->
        <transition name="emoji-fade" mode="out-in">
          <div v-if="!isCompleted" :key="currentEmoji" class="text-8xl mb-6 animate-emoji-pulse">
            {{ currentEmoji }}
          </div>
          <div v-else :key="'complete'" class="text-8xl mb-6">✨</div>
        </transition>

        <!-- 阶段名称 -->
        <div v-if="!isCompleted" class="text-3xl font-semibold text-calm-800 tracking-wide mb-4">
          {{ breathePhase }}
        </div>
        <div v-else class="text-3xl font-semibold text-primary-600 tracking-wide mb-4">完成</div>

        <!-- 倒计时 -->
        <div v-if="!isCompleted" class="text-xl text-calm-600 font-medium mb-2">
          倒计时
          <span
            class="text-primary-600 font-bold text-2xl countdown-transition inline-block min-w-[1.5em] text-center"
            :class="{
              'scale-105': countdown <= 3,
              'text-primary-700': countdown <= 2
            }"
            :key="countdown"
          >
            {{ countdown }}
          </span>
          秒
        </div>
        <div v-else class="text-xl text-primary-500 font-medium mb-2">🎉 呼吸练习完成</div>

        <!-- 进度指示器 -->
        <div class="mt-6">
          <div class="flex justify-center space-x-2">
            <div
              v-for="(phase, index) in ['吸气', '屏息', '呼气']"
              :key="index"
              class="w-3 h-3 rounded-full transition-all duration-300"
              :class="
                breathePhase === phase
                  ? 'bg-primary-500 scale-125'
                  : phaseIndex === index
                    ? 'bg-primary-300'
                    : 'bg-calm-200'
              "
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示文字 - 更靠近主内容 -->
    <div class="mt-4 mb-6 max-w-md text-center px-4">
      <div class="bg-calm-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover-scale">
        <p class="text-lg text-calm-700 font-medium mb-3">🌬️ 专注当下</p>
        <p class="text-calm-500 leading-relaxed">观察呼吸的自然节奏，让注意力停留在此时此刻。</p>
      </div>
    </div>

    <!-- 跳过按钮（呼吸练习结束前显示） -->
    <button v-if="!isCompleted" @click="skipBreathing" class="intervention-skip-btn">
      跳过呼吸练习
    </button>

    <!-- 完成按钮（呼吸练习结束后显示） -->
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

const breathePhase = ref('吸气')
const phaseIndex = ref(0)
const countdown = ref(3)
const breatheTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const phaseTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const isCompleted = ref(false)

// 当前阶段emoji映射 - 使用更现代语义化的emoji
const emojiMap = {
  吸气: '🌬️', // 微风/吸气
  屏息: '🧠', // 大脑/专注
  呼气: '💨', // 呼气/释放
  完成: '✨' // 完成/闪耀
}

const currentEmoji = computed(() => {
  return emojiMap[breathePhase.value as keyof typeof emojiMap] || ''
})

const startBreathing = () => {
  // 8秒一个完整呼吸周期
  const phases = [
    { name: '吸气', duration: 4000 },
    { name: '屏息', duration: 4000 },
    { name: '呼气', duration: 4000 }
  ]

  let currentPhaseIndex = 0

  const updatePhase = () => {
    const phase = phases[currentPhaseIndex]
    breathePhase.value = phase.name
    phaseIndex.value = currentPhaseIndex

    // 更新倒计时
    const totalSeconds = Math.ceil(phase.duration / 1000)
    let secondsLeft = totalSeconds

    // 清除之前的倒计时
    if (phaseTimer.value) {
      clearTimeout(phaseTimer.value)
    }

    // 更新倒计时显示
    const updateCountdown = () => {
      countdown.value = secondsLeft
      secondsLeft--

      if (secondsLeft >= 0) {
        phaseTimer.value = setTimeout(updateCountdown, 1000)
      }
    }

    updateCountdown()

    // 完整的相位定时器
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
    // 标记干预完成
    store.markInterventionCompleted()
    isCompleted.value = true
  }, 60000)
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

const skipBreathing = () => {
  if (breatheTimer.value) {
    clearTimeout(breatheTimer.value)
  }
  if (phaseTimer.value) {
    clearTimeout(phaseTimer.value)
  }
  // 标记干预完成
  store.markInterventionCompleted()
  // 直接跳转到结果页
  goToResult()
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
/* emoji切换动画 - 快速过渡 */
.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.emoji-fade-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

.emoji-fade-leave-to {
  opacity: 0;
  transform: scale(1.2) translateY(-10px);
}

/* 倒计时数字过渡效果 */
.countdown-transition {
  transition: all 0.2s ease;
}

.phase-fade-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.95);
}

.phase-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.95);
}

/* emoji脉搏动画 - 仅在呼吸过程中 */
.animate-emoji-pulse {
  animation: emoji-pulse 4s ease-in-out infinite;
}

@keyframes emoji-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

/* 倒计时数字动画 */
.countdown-pulse {
  animation: countdown-pulse 1s ease-in-out;
}

@keyframes countdown-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 呼吸节奏指示器动画 */
.breathe-indicator {
  animation: breathe-indicator 8s ease-in-out infinite;
}

@keyframes breathe-indicator {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  33% {
    transform: scale(1.1);
    opacity: 1;
  }
  66% {
    transform: scale(1);
    opacity: 0.8;
  }
}

/* 增强阴影效果 */
.shadow-soft {
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    0 1px 4px rgba(0, 0, 0, 0.08);
}

/* 圆角增强 */
.rounded-3xl {
  border-radius: 1.5rem;
}

/* 鼠标悬停效果 */
.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* 模糊背景效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}
</style>
