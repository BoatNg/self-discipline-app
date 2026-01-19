<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] safe-insets">
    <!-- 页面标题 -->
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-medium text-calm-800 mb-4">这一刻，最接近的是哪种感觉？</h2>
      <p class="text-calm-600">选择最接近你此刻感受的选项</p>
    </div>

    <!-- 选择选项 -->
    <div class="w-full max-w-md space-y-3 mb-8" style="max-height: 50vh; overflow-y: scroll; padding: 20px 10px; border: 1px solid #e5e7eb;">
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
      <p class="mb-2">🧠 认知卸载 <span class="text-sm">({{ selectedTextsRef.length }})</span></p>
      <p class="text-sm">可以选择多个描述你此刻的感受</p>
      <p class="text-sm truncate text-green-600" v-if="selectedTextsRef.length > 0" >{{ selectedTextsRef.join(" | ") }}</p>
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
const selectedTextsRef = ref<string[]>([])

const options = [
  // --- 特定时间与场景 ---
  { id: 'late_night', text: '深夜' }, // 新增
  { id: 'morning', text: '早上起来' },
  { id: 'toilet', text: '上厕所' },
  { id: 'pre_subway', text: '上地铁前' },
  { id: 'post_subway', text: '下地铁后' },
  { id: 'gathering', text: '聚餐' },
  { id: 'pre_meal', text: '吃饭前' },
  { id: 'post_meal', text: '吃饱后' }, // 俗称“饭后烟”或“饭后困”的时间点

  // --- 身体与工作状态 ---
  { id: 'post_work', text: '高强度工作后' },
  { id: 'fatigued', text: '身体疲劳' },
  { id: 'post_exercise', text: '运动后' },
  { id: 'alcohol', text: '喝酒了' },

  // --- 心理与情绪触发 ---
  { id: 'achievement', text: '获得成就/解决难题后' }, // 新增
  { id: 'stressed', text: '压力大' },
  { id: 'troubled', text: '有烦恼' },
  { id: 'guilty', text: '愧疚' },
  { id: 'emotional', text: '情绪上来' },

  // --- 外部触发与心理暗示 ---
  { id: 'specific_place', text: '路过特定的地点' },
  { id: 'specific_people', text: '遇到某些人' },
  { id: 'procrastination', text: '特许许可，“明天再说”、“下午再说”...' }
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

  selectedTextsRef.value = selectedTexts
  store.setCognitiveTag(selectedTexts.join('|'))
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
