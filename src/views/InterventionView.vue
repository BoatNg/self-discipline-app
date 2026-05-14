<template>
  <div class="flex flex-col min-h-[calc(100vh-60px)] safe-insets">
    <!-- 退出按钮 -->
    <div class="flex justify-start">
      <button
        @click="cancelIntervention"
        class="text-calm-500 hover:text-calm-700 transition-colors p-2"
        style="font-size: 2rem;"
      >
        ✕
      </button>
    </div>

    <!-- 干预选择界面 -->
    <div v-if="showSelection" class="flex-1 flex flex-col items-center ">
      <div class="mb-8 text-center">
        <h2 class="text-2xl font-medium text-calm-800 mb-4">选一个干预方式</h2>
        <p class="text-calm-600">选择一个你希望尝试的干预方式</p>
      </div>

      <!-- 三个干预选项 -->
      <div class="w-full max-w-md space-y-4 mb-8">
        <button
          v-for="intervention in interventions"
          :key="intervention.type"
          @click="selectIntervention(intervention.type)"
          class="w-full p-5 rounded-xl border-2 text-left transition-all duration-200"
          :class="{
            'border-primary-500 bg-primary-50 text-primary-800': selectedType === intervention.type,
            'border-calm-200 bg-white text-calm-800 hover:border-calm-300 hover:bg-calm-50':
              selectedType !== intervention.type
          }"
        >
          <div class="flex items-start">
            <div
              class="mr-4 w-10 h-10 rounded-full flex items-center justify-center text-lg"
              :class="{
                'bg-primary-500 text-white': selectedType === intervention.type,
                'bg-calm-100 text-calm-600': selectedType !== intervention.type
              }"
            >
              {{ intervention.icon }}
            </div>
            <div>
              <div class="text-lg font-medium">{{ intervention.title }}</div>
              <div class="text-sm text-calm-600 mt-1">{{ intervention.description }}</div>
            </div>
          </div>
        </button>
      </div>

      <!-- 随机选择按钮 -->
      <button @click="selectRandom" class="intervention-skip-btn mb-8">帮我随机选一个</button>

      <!-- 提示文字 -->
      <div class="max-w-sm text-center text-calm-500">
        <p class="text-sm">选择适合你当前状态的干预方式</p>
      </div>
    </div>

    <!-- 干预组件容器 -->
    <div v-else class="flex-1">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted, provide, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import TimerStep from '@/components/TimerStep.vue'
import BreatheStep from '@/components/BreatheStep.vue'
import DumpStep from '@/components/DumpStep.vue'
import EmotionStep from '@/components/EmotionStep.vue'
import type { InterventionType } from '@/types'

const router = useRouter()
const route = useRoute()
const store = useUrgeStore()
const currentComponent = shallowRef()
const showSelection = ref(true)
const selectedType = ref<InterventionType | null>(null)
const interventions = ref([
  {
    type: 'TIMER' as InterventionType,
    title: '等待',
    description: '什么都不做，看着时间过去',
    icon: '⏳'
  },
  {
    type: 'BREATHE' as InterventionType,
    title: '呼吸',
    description: '跟着呼吸节奏，平静内心。吐气，准备开始',
    icon: '🌬️'
  },
  {
    type: 'DUMP' as InterventionType,
    title: '倾诉',
    description: '把此刻感受写下来',
    icon: '💬'
  },
  {
    type: 'EMOTION' as InterventionType,
    title: '情绪标定',
    description: '识别并标记此刻的负面情绪',
    icon: '🎭'
  }
])

// 从路由查询参数中获取任务ID和干预ID
const taskIdFromRoute = route.query.taskId as string
const urgeIdFromRoute = route.query.urgeId as string

// 初始化冲动记录（但不指定干预类型）
let urgeLog: any = null

onMounted(() => {
  // 创建冲动记录，但不指定干预类型
  if (urgeIdFromRoute) {
    // 如果从路由传入了干预ID，找到对应的冲动记录
    urgeLog = store.urgeLogs.find((log) => log.id === urgeIdFromRoute)
    if (!urgeLog) {
      // 如果找不到，创建新的记录，但保留原有的 urgeId
      urgeLog = store.startIntervention(null, urgeIdFromRoute)
    }
  } else {
    // 如果没有干预ID，创建新的记录
    urgeLog = store.startIntervention(null)
  }

  // 如果从路由中传入了任务ID，自动关联到当前的冲动记录
  if (taskIdFromRoute && urgeLog) {
    // 直接更新 store 中的记录
    const logIndex = store.urgeLogs.findIndex((log) => log.id === urgeLog.id)
    if (logIndex !== -1) {
      store.urgeLogs[logIndex].taskId = taskIdFromRoute
    }
  }

  // 提供路由参数给子组件使用
  provide('getRouteParams', () => ({
    taskIdFromRoute,
    urgeIdFromRoute,
    urgeLogId: urgeLog?.id
  }))
})

const selectIntervention = (type: InterventionType) => {
  selectedType.value = type
  showSelection.value = false

  // 更新store中的干预类型
  if (urgeLog) {
    const logIndex = store.urgeLogs.findIndex((log) => log.id === urgeLog.id)
    if (logIndex !== -1) {
      store.urgeLogs[logIndex].assignedIntervention = type
    }
  }

  // 设置对应的组件
  const componentMap = {
    TIMER: TimerStep,
    BREATHE: BreatheStep,
    DUMP: DumpStep,
    EMOTION: EmotionStep
  }
  currentComponent.value = componentMap[type]
}

const selectRandom = () => {
  const interventionTypes: InterventionType[] = ['TIMER', 'BREATHE', 'DUMP', 'EMOTION']
  const randomType = interventionTypes[Math.floor(Math.random() * interventionTypes.length)]
  selectIntervention(randomType)
}

const cancelIntervention = () => {
  // 静默保存未完成的日志
  if (store.urgeLogs.length > 0) {
    store.urgeLogs[0].isCompleted = false
  }

  store.cancelIntervention()
  router.push('/')
}
</script>
