<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-medium text-calm-800 mb-4">这一刻，最接近的是哪种感觉？</h2>
      <p class="text-calm-600">选择最接近你此刻感受的选项</p>
    </div>

    <!-- 选择选项 -->
    <div class="w-full max-w-md space-y-3 mb-8">
      <button
        v-for="option in options"
        :key="option.id"
        @click="toggleOption(option.id)"
        class="w-full p-5 rounded-xl border-2 text-left transition-all duration-200"
        :class="{
          'border-primary-500 bg-primary-50 text-primary-800': selectedOptions.includes(option.id),
          'border-calm-200 bg-white text-calm-800 hover:border-calm-300 hover:bg-calm-50':
            !selectedOptions.includes(option.id)
        }"
      >
        <div class="flex items-center">
          <div
            class="mr-4 w-8 h-8 rounded-full border-2 flex items-center justify-center"
            :class="{
              'border-primary-500 bg-primary-500 text-white': selectedOptions.includes(option.id),
              'border-calm-300': !selectedOptions.includes(option.id)
            }"
          >
            <span v-if="selectedOptions.includes(option.id)">✓</span>
          </div>
          <div class="text-lg font-medium">{{ option.text }}</div>
        </div>
      </button>
    </div>

    <!-- 提示文字 -->
    <div class="mt-8 mb-4 max-w-sm text-center text-calm-500">
      <p class="mb-2">🧠 认知卸载</p>
      <p class="text-sm">可以选择多个描述你此刻的感受</p>
    </div>

    <!-- 完成按钮（选择选项后显示） -->
    <button
      v-if="selectedOptions.length > 0"
      @click="goToResult"
      class="btn-primary w-full max-w-md"
    >
      完成
    </button>

    <!-- 跳过按钮 -->
    <!-- <button @click="skipSelection" class="intervention-skip-btn">跳过</button> -->
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'

const router = useRouter()
const store = useUrgeStore()

// 从父组件注入的方法
const getRouteParams = inject<() => any>('getRouteParams')
const selectedOptions = ref<string[]>([])

const options = [
  { id: 'annoyed', text: '有点烦 / 有点撑不住' },
  { id: 'urge', text: '很想立刻做点什么' },
  { id: 'racing', text: '脑子停不下来' },
  { id: 'emotional', text: '情绪上来了' },
  { id: 'unknown', text: '说不清楚' }
]

const toggleOption = (optionId: string) => {
  const index = selectedOptions.value.indexOf(optionId)
  if (index === -1) {
    selectedOptions.value.push(optionId)
  } else {
    selectedOptions.value.splice(index, 1)
  }

  // 完成干预并记录选择
  store.markInterventionCompleted()

  // 记录多个认知标签
  const selectedTexts = selectedOptions.value
    .map((id) => options.find((opt) => opt.id === id)?.text || id)
    .filter(Boolean)
  store.setCognitiveTag(selectedTexts.join(', '))
}

// 跳转到结果页面
const goToResult = () => {
  // 从父组件获取路由参数
  const routeParams = getRouteParams ? getRouteParams() : {}
  const taskIdFromRoute = routeParams.taskIdFromRoute
  const urgeLogId = routeParams.urgeLogId

  const query: Record<string, string> = {}
  if (taskIdFromRoute) query.taskId = taskIdFromRoute
  if (urgeLogId) query.urgeId = urgeLogId

  router.push({ path: '/result', query })
}

// const skipSelection = () => {
//   // 跳过时不标记为完成，直接返回首页
//   store.cancelIntervention()
//   router.push('/')
// }
</script>
