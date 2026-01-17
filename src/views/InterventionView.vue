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
import { shallowRef, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import TimerStep from '@/components/TimerStep.vue'
import BreatheStep from '@/components/BreatheStep.vue'
import DumpStep from '@/components/DumpStep.vue'
import type { InterventionType } from '@/types'

const router = useRouter()
const route = useRoute()
const store = useUrgeStore()
const currentComponent = shallowRef()

onMounted(() => {
  // 从路由查询参数中获取任务ID和干预ID
  const taskIdFromRoute = route.query.taskId as string
  const urgeIdFromRoute = route.query.urgeId as string

  // 随机选择干预类型
  const interventionTypes: InterventionType[] = ['TIMER', 'BREATHE', 'DUMP']
  const randomType = interventionTypes[Math.floor(Math.random() * interventionTypes.length)]

  let urgeLog: any

  if (urgeIdFromRoute) {
    // 如果从路由传入了干预ID，找到对应的冲动记录并更新干预类型
    urgeLog = store.urgeLogs.find((log) => log.id === urgeIdFromRoute)
    if (urgeLog) {
      urgeLog.assignedIntervention = randomType
    } else {
      // 如果找不到，创建新的记录，但保留原有的 urgeId
      urgeLog = store.startIntervention(randomType, urgeIdFromRoute)
    }
  } else {
    // 如果没有干预ID，创建新的记录
    urgeLog = store.startIntervention(randomType)
  }

  // 如果从路由中传入了任务ID，自动关联到当前的冲动记录
  if (taskIdFromRoute && urgeLog) {
    // 直接更新 store 中的记录
    const logIndex = store.urgeLogs.findIndex((log) => log.id === urgeLog.id)
    if (logIndex !== -1) {
      store.urgeLogs[logIndex].taskId = taskIdFromRoute
    }
  }

  // 设置对应的组件
  const componentMap = {
    TIMER: TimerStep,
    BREATHE: BreatheStep,
    DUMP: DumpStep
  }

  currentComponent.value = componentMap[randomType]

  // 提供路由参数给子组件使用
  provide('getRouteParams', () => ({
    taskIdFromRoute,
    urgeIdFromRoute,
    urgeLogId: urgeLog?.id
  }))
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
