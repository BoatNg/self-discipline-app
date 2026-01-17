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
      <div class="card">
        <div class="text-calm-500 text-sm mb-1">今日打卡</div>
        <div class="text-3xl font-bold text-green-600">{{ store.todayCheckInCount }}</div>
      </div>
      <div class="card">
        <div class="text-calm-500 text-sm mb-1">完成率</div>
        <div class="text-3xl font-bold text-blue-600">{{ store.todayDoWantCompletionRate }}%</div>
      </div>
    </div>

    <!-- 任务展示区 -->
    <div class="mb-8">
      <h3 class="text-lg font-medium text-calm-800 mb-4">我的任务</h3>

      <div v-if="sortedTasks.length === 0" class="text-center py-6 bg-calm-50 rounded-xl">
        <div class="text-4xl mb-3">📝</div>
        <p class="text-calm-600">还没有活跃的任务</p>
        <p class="text-calm-400 text-sm mt-2">点击下方按钮创建第一个任务</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="task in sortedTasks"
          :key="task.id"
          class="card flex items-center justify-between"
          :class="
            task.type === 'DO_WANT'
              ? 'border-l-4 border-l-green-500'
              : 'border-l-4 border-l-orange-500'
          "
        >
          <div class="flex items-center">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              :class="
                task.type === 'DO_WANT'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
              "
            >
              {{ task.type === 'DO_WANT' ? '💪' : '🚫' }}
            </div>
            <div>
              <div class="font-medium text-calm-800">{{ task.name }}</div>
              <div class="text-xs text-calm-500">{{ getTaskStatusText(task) }}</div>
            </div>
          </div>

          <button
            @click="handleTaskClick(task)"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="getTaskButtonClass(task)"
          >
            {{ getTaskButtonText(task) }}
          </button>
        </div>
      </div>
    </div>

    <!-- 创建任务按钮 -->
    <div class="mt-8">
      <button
        @click="goToCreateTask"
        class="w-full p-4 rounded-2xl border-2 border-green-300 bg-green-50 text-green-800 text-center font-medium transition-all duration-200 hover:border-green-400 hover:bg-green-100"
      >
        💪 创建新任务
      </button>
    </div>

    <!-- 提示 -->
    <div class="mt-4 p-4 bg-calm-100 rounded-xl text-calm-600 text-sm">
      <p class="mb-2">💡 使用提示：</p>
      <ul class="space-y-1">
        <li>• 有冲动时，点击上方的大按钮</li>
        <li>• 想要培养习惯，点击任务列表中的任务</li>
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
import type { Task, TaskStatus } from '@/types'
import { computed } from 'vue'

const router = useRouter()
const store = useUrgeStore()

// 计算属性：获取排序后的任务列表
const sortedTasks = computed(() => {
  const tasks = [...store.activeTasks]

  return tasks.sort((a, b) => {
    // 1. 按任务类型排序："我不要"在前，"我想要"在后
    if (a.type !== b.type) {
      return a.type === 'DONT_WANT' ? -1 : 1
    }

    // 2. 按任务状态排序：活跃任务在前，未开始/已完成/失败/过期在后
    const statusA = store.calculateTaskStatus(a)
    const statusB = store.calculateTaskStatus(b)

    const getStatusPriority = (status: TaskStatus): number => {
      if (status === 'ACTIVE' && store.isTaskActive(a)) return 1 // 活跃中的任务
      if (status === 'ACTIVE') return 2 // 未开始的任务
      return 3 // 已完成/失败/过期的任务
    }

    const priorityA = getStatusPriority(statusA)
    const priorityB = getStatusPriority(statusB)

    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    // 3. 按创建时间排序：最新的在前
    return parseInt(b.id) - parseInt(a.id)
  })
})

const startIntervention = (taskId?: string) => {
  console.log('按钮被点击，开始干预流程', taskId ? `任务ID: ${taskId}` : '')
  // 先创建一个冲动记录（干预类型将在 InterventionView 中设置）
  const urgeLog = store.startIntervention('TIMER') // 先使用默认类型，InterventionView会重新设置
  const urgeId = urgeLog.id

  // 传递任务ID和干预ID到干预页面
  const query: Record<string, string> = {}
  if (taskId) query.taskId = taskId
  if (urgeId) query.urgeId = urgeId

  router.push({ path: '/intervention', query }).catch((err) => {
    console.error('路由跳转失败:', err)
  })
}

// 处理任务点击
const handleTaskClick = (task: Task) => {
  const status = store.calculateTaskStatus(task)

  // 检查任务是否可以操作
  if (task.type === 'DO_WANT') {
    // "我想要"任务：检查是否在有效期内且未完成/失败
    if (!store.isTaskActive(task) || status === 'COMPLETED' || status === 'FAILED') {
      // 任务未开始或已完成/失败，不执行操作
      return
    }

    // 跳转到打卡页面
    router.push(`/checkin/${task.id}`)
  } else {
    // "我不要"任务：传递任务ID到干预流程
    startIntervention(task.id)
  }
}

// 获取任务状态文本
const getTaskStatusText = (task: Task) => {
  const status = store.calculateTaskStatus(task)

  // 对于"我不要"类型的任务，显示冲动次数和抗住次数
  if (task.type === 'DONT_WANT') {
    const stats = store.getTaskStats(task.id)
    console.log(`任务 "${task.name}" (ID: ${task.id}) 的统计:`, stats)
    if (stats) {
      const resistedCount = stats.resistedCount || 0
      const totalCount = stats.associationCount || 0
      return `冲动${totalCount}次，抗住${resistedCount}次`
    }
    return '尚未关联冲动记录'
  }

  // 对于"我想要"类型的任务，保持原有逻辑
  switch (status) {
    case 'ACTIVE':
      if (!store.isTaskActive(task)) {
        return '未开始'
      }
      const hasCheckedIn = store.hasCheckedInToday(task.id)
      return hasCheckedIn ? '今日已打卡' : '今日未打卡'
    case 'COMPLETED':
      return '已完成'
    case 'FAILED':
      return '未完成'
    case 'EXPIRED':
      return '已过期'
    default:
      return '未知状态'
  }
}

// 获取任务按钮文本
const getTaskButtonText = (task: Task) => {
  if (task.type === 'DO_WANT') {
    const hasCheckedIn = store.hasCheckedInToday(task.id)
    return hasCheckedIn ? '已打卡' : '打卡'
  } else {
    return '干预'
  }
}

// 获取任务按钮样式
const getTaskButtonClass = (task: Task) => {
  const status = store.calculateTaskStatus(task)

  if (task.type === 'DO_WANT') {
    const hasCheckedIn = store.hasCheckedInToday(task.id)

    // 如果任务未开始、已过期或已完成/失败，按钮显示为禁用状态
    if (!store.isTaskActive(task) || status === 'COMPLETED' || status === 'FAILED') {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed'
    }

    return hasCheckedIn
      ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-not-allowed'
      : 'bg-green-500 text-white hover:bg-green-600'
  } else {
    return 'bg-calm-800 text-white hover:bg-calm-900'
  }
}

// 跳转到创建任务页面
const goToCreateTask = () => {
  router.push('/task/create')
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
