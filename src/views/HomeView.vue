<template>
  <div class="flex flex-col min-h-[calc(100vh-120px)]">
    <!-- 统计数据 -->
    <div class="grid grid-cols-2 gap-4 mb-8">
      <div class="card">
        <div class="text-calm-500 text-sm mb-1">今日冲动</div>
        <div class="text-3xl font-bold text-calm-800">{{ store.todayCount }}</div>
      </div>
      <div class="card">
        <div class="text-calm-500 text-sm mb-1">今日干预</div>
        <div class="text-3xl font-bold text-primary-600">{{ store.todayToolUsage }}</div>
      </div>
    </div>

    <!-- 主按钮 -->
    <div class="flex-1 flex flex-col items-center justify-center thumb-zone">
      <button
        @click="startIntervention"
        class="w-64 h-64 rounded-full bg-calm-800 text-white text-2xl font-medium flex items-center justify-center mb-6 focus:outline-none active:bg-calm-900"
      >
        <span class="text-center">我现在有冲动</span>
      </button>

      <p class="text-calm-500 text-center max-w-xs">点击上面的按钮，让我们一起面对冲动</p>
    </div>

    <!-- 提示 -->
    <div class="mt-8 p-4 bg-calm-100 rounded-xl text-calm-600 text-sm">
      <p class="mb-2">💡 使用提示：</p>
      <ul class="space-y-1">
        <li>• 有冲动时，点击上方的大按钮</li>
        <li>• 不需要解释原因或选择任务</li>
        <li>• 退出干预流程不会被视为失败</li>
        <li>• 所有数据都保存在您的设备上</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'

const router = useRouter()
const store = useUrgeStore()

const startIntervention = () => {
  console.log('按钮被点击，开始干预流程')
  // 干预类型将在 InterventionView 中随机选择
  // 这里只需要跳转
  router.push('/intervention').catch((err) => {
    console.error('路由跳转失败:', err)
  })
}
</script>

<style scoped>
button {
  box-shadow: 0 10px 25px rgba(30, 41, 59, 0.3);
}

button:hover {
  box-shadow: 0 15px 30px rgba(30, 41, 59, 0.4);
  transform: translateY(-2px);
}

button:active {
  box-shadow: 0 5px 15px rgba(30, 41, 59, 0.3);
  transform: translateY(0);
}
</style>
