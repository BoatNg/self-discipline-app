<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] safe-insets">
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

    <!-- 任务关联入口 -->
    <div v-if="store.isInIntervention" class="w-full max-w-md mb-8">
      <!-- 任务关联选择 -->
      <div class="text-center p-4 bg-calm-50 rounded-xl">
        <p class="text-calm-600 mb-3">这次冲动和哪个任务相关？（可选）</p>

        <!-- 如果已经有选择的任务，显示当前选择 -->
        <div
          v-if="selectedTaskId"
          class="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div
                class="w-5 h-5 rounded-full bg-primary-500 mr-2 flex items-center justify-center"
              >
                <span class="text-white text-xs">✓</span>
              </div>
              <span class="text-primary-600 font-medium">{{ getSelectedTaskName() }}</span>
            </div>
            <button @click="clearTaskSelection" class="text-calm-500 hover:text-calm-700 text-sm">
              取消
            </button>
          </div>
        </div>

        <!-- 选择任务按钮（只有在没有自动匹配时才显示） -->
        <button
          v-if="!hasAutoMatchedTask"
          @click="showTaskSelection = true"
          class="btn-secondary w-full text-primary-600 border-primary-200 hover:bg-primary-50"
        >
          {{ selectedTaskId ? '重新选择' : '选择「我不要」任务' }}
        </button>

        <!-- 如果没有"我不要"任务，显示添加任务按钮 -->
        <div v-if="store.tasks.filter((t) => t.type === 'DONT_WANT').length === 0" class="mt-3">
          <p class="text-calm-500 text-sm mb-2">还没有「我不要」类型的任务</p>
          <button
            @click="showAddTask = true"
            class="btn-secondary w-full text-green-600 border-green-200 hover:bg-green-50"
          >
            添加新任务
          </button>
        </div>
      </div>
    </div>

    <!-- 完成按钮 -->
    <button
      @click="completeIntervention"
      class="btn-primary w-full max-w-md"
      :disabled="!selectedOutcome"
    >
      完成记录
    </button>

    <!-- 任务选择底部弹窗 -->
    <div
      v-if="showTaskSelection"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      @click.self="showTaskSelection = false"
    >
      <div class="bg-white rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-medium text-calm-800 mb-4">这次冲动，更像是下面哪个？</h3>

          <!-- 任务列表（只显示"我不要"任务） -->
          <div class="space-y-3 mb-6">
            <button
              v-for="task in store.tasks.filter((t) => t.type === 'DONT_WANT')"
              :key="task.id"
              @click="selectTask(task.id)"
              class="w-full p-4 text-left rounded-xl border-2 transition-all duration-200"
              :class="{
                'border-primary-500 bg-primary-50': selectedTaskId === task.id,
                'border-calm-200 bg-white hover:border-primary-300 hover:bg-primary-50':
                  selectedTaskId !== task.id
              }"
            >
              <div class="flex items-center">
                <div
                  class="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center"
                  :class="{
                    'border-primary-500 bg-primary-500': selectedTaskId === task.id,
                    'border-calm-300': selectedTaskId !== task.id
                  }"
                >
                  <span v-if="selectedTaskId === task.id" class="text-white text-xs">✓</span>
                </div>
                <span>{{ task.name }}</span>
              </div>
            </button>
          </div>

          <!-- 不确定/不关联选项 -->
          <button
            @click="clearTaskSelection"
            class="w-full p-4 text-center rounded-xl border-2 border-calm-200 bg-white text-calm-600 hover:border-calm-300 hover:bg-calm-50 transition-all duration-200"
          >
            不确定 / 不关联
          </button>
        </div>
      </div>
    </div>

    <!-- 快速添加任务弹窗 -->
    <div
      v-if="showAddTask"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showAddTask = false"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-calm-800 mb-4">添加新任务</h3>

        <input
          v-model="newTaskName"
          type="text"
          placeholder="输入任务名称，如：不刷短视频"
          class="w-full p-3 border border-calm-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-300"
          @keyup.enter="addTaskFromResult"
        />

        <div class="flex space-x-3">
          <button @click="showAddTask = false" class="btn-secondary flex-1">取消</button>
          <button
            @click="addTaskFromResult"
            :disabled="!newTaskName.trim()"
            class="btn-primary flex-1"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import type { Outcome } from '@/types'

const router = useRouter()
const route = useRoute()
const store = useUrgeStore()
const selectedOutcome = ref<Outcome>(null)
const selectedTaskId = ref<string | undefined>(undefined)
const hasAutoMatchedTask = ref(false)
const showTaskSelection = ref(false)
const showAddTask = ref(false)
const newTaskName = ref('')

// 从路由查询参数中获取任务ID和干预ID
onMounted(() => {
  const taskIdFromRoute = route.query.taskId as string
  const urgeIdFromRoute = route.query.urgeId as string

  console.log('结果页面接收到的参数:', { taskIdFromRoute, urgeIdFromRoute })

  // 如果有从路由传递的任务ID，且任务存在且是"我不要"类型，设置为自动匹配
  if (taskIdFromRoute) {
    const task = store.tasks.find((t) => t.id === taskIdFromRoute && t.type === 'DONT_WANT')
    if (task) {
      selectedTaskId.value = taskIdFromRoute
      hasAutoMatchedTask.value = true
    }
  }
})

const selectOutcome = (outcome: 'resisted' | 'relapsed') => {
  selectedOutcome.value = outcome
}

const selectTask = (taskId: string) => {
  selectedTaskId.value = taskId
  showTaskSelection.value = false
}

const clearTaskSelection = () => {
  selectedTaskId.value = undefined
  showTaskSelection.value = false
}

const addTaskFromResult = () => {
  if (newTaskName.value.trim()) {
    const newTask = store.addTask(newTaskName.value.trim())
    // 自动关联新创建的任务
    selectedTaskId.value = newTask.id
    newTaskName.value = ''
    showAddTask.value = false
  }
}

const getSelectedTaskName = () => {
  if (!selectedTaskId.value) return ''
  const task = store.tasks.find((t) => t.id === selectedTaskId.value)
  return task ? task.name : ''
}

const completeIntervention = () => {
  if (selectedOutcome.value) {
    store.completeIntervention(selectedOutcome.value, selectedTaskId.value)
    router.push('/')
  }
}
</script>
