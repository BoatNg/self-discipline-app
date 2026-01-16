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
        @click="selectOption(option.id)"
        class="w-full p-5 rounded-xl border-2 text-left transition-all duration-200"
        :class="{
          'border-primary-500 bg-primary-50 text-primary-800': selectedOption === option.id,
          'border-calm-200 bg-white text-calm-800 hover:border-calm-300 hover:bg-calm-50':
            selectedOption !== option.id
        }"
      >
        <div class="flex items-center">
          <div
            class="mr-4 w-8 h-8 rounded-full border-2 flex items-center justify-center"
            :class="{
              'border-primary-500 bg-primary-500 text-white': selectedOption === option.id,
              'border-calm-300': selectedOption !== option.id
            }"
          >
            <span v-if="selectedOption === option.id">✓</span>
          </div>
          <div class="text-lg font-medium">{{ option.text }}</div>
        </div>
      </button>
    </div>

    <!-- 提示文字 -->
    <div class="mt-8 mb-4 max-w-sm text-center text-calm-500">
      <p class="mb-2">🧠 认知卸载</p>
      <p class="text-sm">选择最接近的感受，不需要思考清楚</p>
    </div>

    <!-- 跳过按钮 -->
    <!-- <button @click="skipSelection" class="intervention-skip-btn">跳过</button> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'

const router = useRouter()
const store = useUrgeStore()
const selectedOption = ref<string | null>(null)

const options = [
  { id: 'annoyed', text: '有点烦 / 有点撑不住' },
  { id: 'urge', text: '很想立刻做点什么' },
  { id: 'racing', text: '脑子停不下来' },
  { id: 'emotional', text: '情绪上来了' },
  { id: 'unknown', text: '说不清楚' }
]

const selectOption = (optionId: string) => {
  selectedOption.value = optionId

  // 立即完成干预并记录选择
  store.markInterventionCompleted()

  // 记录认知标签
  const optionText = options.find((opt) => opt.id === optionId)?.text || optionId
  store.setCognitiveTag(optionText)

  // 跳转到结果页面
  router.push('/result')
}

// const skipSelection = () => {
//   // 跳过时不标记为完成，直接返回首页
//   store.cancelIntervention()
//   router.push('/')
// }
</script>
