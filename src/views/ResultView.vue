<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-medium text-calm-800 mb-4">最后一步</h2>
      <p class="text-calm-600">选择最符合你当前状态的结果</p>
    </div>

    <!-- 结果选项 -->
    <div class="grid grid-cols-1 gap-4 w-full max-w-md mb-8">
      <button
        @click="selectOutcome('resisted')"
        class="p-6 rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-lg"
        :class="{
          'border-green-500 bg-green-50 text-green-800': selectedOutcome === 'resisted',
          'border-calm-200 bg-white text-calm-800 hover:border-green-300 hover:bg-green-50':
            selectedOutcome !== 'resisted'
        }"
      >
        <div class="text-4xl mb-3">✅</div>
        <div class="text-xl font-medium mb-2">我扛住了</div>
        <div class="text-sm text-calm-500">冲动过去了，我没有屈服</div>
      </button>

      <button
        @click="selectOutcome('relapsed')"
        class="p-6 rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-lg"
        :class="{
          'border-calm-500 bg-calm-50 text-calm-800': selectedOutcome === 'relapsed',
          'border-calm-200 bg-white text-calm-800 hover:border-calm-300 hover:bg-calm-50':
            selectedOutcome !== 'relapsed'
        }"
      >
        <div class="text-4xl mb-3">📝</div>
        <div class="text-xl font-medium mb-2">我没扛住</div>
        <div class="text-sm text-calm-500">我还是做了，但没关系</div>
      </button>
    </div>

    <!-- 提示文字 -->
    <div class="max-w-sm text-center text-calm-500 mb-8">
      <p class="mb-2">🎯 两种结果都是有效的</p>
      <p class="text-sm">使用工具本身就是进步，结果只是记录</p>
    </div>

    <!-- 完成按钮 -->
    <button
      @click="completeIntervention"
      class="btn-primary w-full max-w-md"
      :disabled="!selectedOutcome"
    >
      完成记录
    </button>

    <!-- 跳过按钮 -->
    <button @click="skipResult" class="mt-4 text-calm-500 hover:text-calm-700 transition-colors">
      跳过，不记录结果
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import type { Outcome } from '@/types'

const router = useRouter()
const store = useUrgeStore()
const selectedOutcome = ref<Outcome>(null)

const selectOutcome = (outcome: 'resisted' | 'relapsed') => {
  selectedOutcome.value = outcome
}

const completeIntervention = () => {
  if (selectedOutcome.value) {
    store.completeIntervention(selectedOutcome.value)
    router.push('/')
  }
}

const skipResult = () => {
  // 标记为未记录结果，直接返回首页
  store.completeIntervention(null)
  router.push('/')
}
</script>
