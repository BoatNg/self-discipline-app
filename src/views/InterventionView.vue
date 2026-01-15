<template>
  <div class="flex flex-col min-h-[calc(100vh-60px)]">
    <!-- 退出按钮 -->
    <div class="flex justify-start mb-6">
      <button
        @click="cancelIntervention"
        class="text-calm-500 hover:text-calm-700 transition-colors p-2"
      >
        ✕
      </button>
    </div>
    
    <!-- 随机干预组件 -->
    <div class="flex-1">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import TimerStep from '@/components/TimerStep.vue'
import BreatheStep from '@/components/BreatheStep.vue'
import DumpStep from '@/components/DumpStep.vue'
import type { InterventionType } from '@/types'

const router = useRouter()
const store = useUrgeStore()
const currentComponent = shallowRef()

onMounted(() => {
  // 随机选择干预类型
  const interventionTypes: InterventionType[] = ['TIMER', 'BREATHE', 'DUMP']
  const randomType = interventionTypes[Math.floor(Math.random() * interventionTypes.length)]
  
  // 开始干预并记录
  store.startIntervention(randomType)
  
  // 设置对应的组件
  const componentMap = {
    TIMER: TimerStep,
    BREATHE: BreatheStep,
    DUMP: DumpStep
  }
  
  currentComponent.value = componentMap[randomType]
})

const cancelIntervention = () => {
  // 静默保存未完成的日志
  if (store.urgeLogs.length > 0) {
    store.urgeLogs[0].isCompleted = false
  }
  
  store.cancelIntervention()
  router.push('/')
}
</script>