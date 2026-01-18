<template>
  <div>
    <!-- 任务管理 -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-calm-800">任务管理</h2>
        <button @click="goToTaskCreate" class="btn-primary py-2 px-4 text-sm">添加任务</button>
      </div>

      <div v-if="store.tasks.length === 0" class="text-center py-8 bg-calm-50 rounded-xl">
        <div class="text-6xl mb-4">🎯</div>
        <p class="text-calm-500">还没有创建任务</p>
        <p class="text-calm-400 text-sm mt-2">点击上方按钮添加第一个任务</p>
      </div>

      <!-- "我不要"任务 -->
      <div v-if="dontWantTasks.length > 0" class="mb-6">
        <h3 class="text-lg font-medium text-calm-700 mb-3">「我不要」任务</h3>
        <div class="space-y-3">
          <div v-for="task in dontWantTasks" :key="task.id" class="card">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <button
                  @click="store.toggleTask(task.id)"
                  class="mr-3 w-8 h-8 rounded-full border-2 flex items-center justify-center"
                  :class="{
                    'border-primary-500 bg-primary-500': task.isEnabled,
                    'border-calm-300': !task.isEnabled
                  }"
                >
                  <span v-if="task.isEnabled" class="text-white">✓</span>
                </button>
                <span :class="{ 'text-calm-400 line-through': !task.isEnabled }">
                  {{ task.name }}
                </span>
              </div>

              <button
                @click="store.deleteTask(task.id)"
                class="text-calm-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <!-- 统计信息 -->
            <div v-if="store.getTaskStats(task.id)" class="pl-11">
              <div class="text-xs text-calm-500 space-y-1">
                <div class="flex justify-between">
                  <span>任务周期:</span>
                  <span class="font-medium">{{ formatTaskPeriod(task) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>关联次数:</span>
                  <span class="font-medium">{{
                    store.getTaskStats(task.id)?.associationCount || 0
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span>成功率:</span>
                  <span class="font-medium"
                    >{{ store.getTaskStats(task.id)?.successRate || 0 }}%</span
                  >
                </div>
                <div
                  v-if="store.getTaskStats(task.id)?.lastAssociatedAt"
                  class="flex justify-between"
                >
                  <span>最近关联:</span>
                  <span class="font-medium">
                    {{ formatDate(store.getTaskStats(task.id)!.lastAssociatedAt!) }}
                  </span>
                </div>
                <div v-else class="text-calm-400 italic">尚未关联过冲动记录</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- "我想要"任务 -->
      <div v-if="doWantTasks.length > 0" class="mb-6">
        <h3 class="text-lg font-medium text-calm-700 mb-3">「我想要」任务</h3>
        <div class="space-y-3">
          <div v-for="task in doWantTasks" :key="task.id" class="card">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <button
                  @click="store.toggleTask(task.id)"
                  class="mr-3 w-8 h-8 rounded-full border-2 flex items-center justify-center"
                  :class="{
                    'border-green-500 bg-green-500': task.isEnabled,
                    'border-calm-300': !task.isEnabled
                  }"
                >
                  <span v-if="task.isEnabled" class="text-white">✓</span>
                </button>
                <span :class="{ 'text-calm-400 line-through': !task.isEnabled }">
                  {{ task.name }}
                </span>
              </div>

              <button
                @click="store.deleteTask(task.id)"
                class="text-calm-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <!-- 任务周期信息 -->
            <div class="pl-11">
              <div class="text-xs text-calm-500 space-y-1">
                <div class="flex justify-between">
                  <span>任务周期:</span>
                  <span class="font-medium">{{ formatTaskPeriod(task) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>今日打卡:</span>
                  <span class="font-medium">
                    {{ store.hasCheckedInToday(task.id) ? '✅ 已完成' : '⏳ 待完成' }}
                  </span>
                </div>
                <div v-if="store.getTaskCheckIns(task.id).length > 0" class="flex justify-between">
                  <span>累计打卡:</span>
                  <span class="font-medium">{{ store.getTaskCheckIns(task.id).length }} 次</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="card mb-6">
      <h3 class="font-medium text-calm-800 mb-3">数据管理</h3>
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-calm-600">存储的数据</span>
          <span class="text-calm-800 font-medium">
            {{ store.tasks.length }} 个任务, {{ store.urgeLogs.length }} 条记录
          </span>
        </div>

        <div class="flex space-x-3">
          <button
            @click="clearAllData"
            class="btn-secondary flex-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            清除所有数据
          </button>
        </div>
      </div>
    </div>

    <!-- 应用信息 -->
    <div class="card">
      <h3 class="font-medium text-calm-800 mb-3">关于应用</h3>
      <div class="text-calm-600 text-sm space-y-2">
        <p>版本: 1.0.0</p>
        <p>这是一个本地运行的PWA应用，所有数据都保存在您的设备上。</p>
        <p class="text-xs text-calm-400 mt-4">「我不要」- 冲动管理工具</p>
      </div>
    </div>

    <!-- 确认清除弹窗 -->
    <div
      v-if="showConfirmClear"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showConfirmClear = false"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <div class="text-6xl text-red-500 mb-4 text-center">⚠️</div>
        <h3 class="text-lg font-medium text-calm-800 mb-2 text-center">确认清除数据</h3>
        <p class="text-calm-600 text-center mb-6">这将删除所有任务和记录，无法恢复。确定继续吗？</p>

        <div class="flex space-x-3">
          <button @click="showConfirmClear = false" class="btn-secondary flex-1">取消</button>
          <button @click="confirmClearData" class="btn-primary flex-1 bg-red-500 hover:bg-red-600">
            确认清除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import type { Task } from '@/types'

const router = useRouter()
const store = useUrgeStore()
const showConfirmClear = ref(false)

// 计算属性：筛选不同类型的任务
const dontWantTasks = computed(() => {
  return store.tasks.filter((task) => task.type === 'DONT_WANT')
})

const doWantTasks = computed(() => {
  return store.tasks.filter((task) => task.type === 'DO_WANT')
})

const goToTaskCreate = () => {
  router.push('/task/create')
}

const clearAllData = () => {
  showConfirmClear.value = true
}

const confirmClearData = () => {
  store.tasks = []
  store.urgeLogs = []
  store.checkInRecords = []
  showConfirmClear.value = false
}

const formatTaskPeriod = (task: Task) => {
  const startDate = new Date(task.startDate)
  const endDate = new Date(task.endDate)
  const totalDays = Math.ceil((task.endDate - task.startDate) / (24 * 60 * 60 * 1000))

  // 根据任务类型显示不同的前缀
  if (task.type === 'DONT_WANT') {
    return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()} (${totalDays}天)`
  } else {
    return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()} (${totalDays}天)`
  }
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (dateTime.getTime() === today.getTime()) {
    return '今天'
  } else if (dateTime.getTime() === yesterday.getTime()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}
</script>
