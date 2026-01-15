<template>
  <div>
    <!-- 任务管理 -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-calm-800">「我不要」任务</h2>
        <button @click="showAddTask = true" class="btn-primary py-2 px-4 text-sm">添加任务</button>
      </div>

      <div v-if="store.tasks.length === 0" class="text-center py-8 bg-calm-50 rounded-xl">
        <div class="text-6xl mb-4">🎯</div>
        <p class="text-calm-500">还没有创建任务</p>
        <p class="text-calm-400 text-sm mt-2">点击上方按钮添加第一个任务</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="task in store.tasks"
          :key="task.id"
          class="card flex items-center justify-between"
        >
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
      </div>
    </div>

    <!-- 应用信息 -->
    <div class="card mb-6">
      <h3 class="font-medium text-calm-800 mb-3">关于应用</h3>
      <div class="text-calm-600 text-sm space-y-2">
        <p>版本: 1.0.0</p>
        <p>这是一个本地运行的PWA应用，所有数据都保存在您的设备上。</p>
        <p class="text-xs text-calm-400 mt-4">「我不要」- 冲动管理工具</p>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="card">
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

    <!-- 添加任务弹窗 -->
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
          @keyup.enter="addTask"
        />

        <div class="flex space-x-3">
          <button @click="showAddTask = false" class="btn-secondary flex-1">取消</button>
          <button @click="addTask" :disabled="!newTaskName.trim()" class="btn-primary flex-1">
            添加
          </button>
        </div>
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
import { ref } from 'vue'
import { useUrgeStore } from '@/stores/useUrgeStore'

const store = useUrgeStore()
const showAddTask = ref(false)
const showConfirmClear = ref(false)
const newTaskName = ref('')

const addTask = () => {
  if (newTaskName.value.trim()) {
    store.addTask(newTaskName.value.trim())
    newTaskName.value = ''
    showAddTask.value = false
  }
}

const clearAllData = () => {
  showConfirmClear.value = true
}

const confirmClearData = () => {
  store.tasks = []
  store.urgeLogs = []
  showConfirmClear.value = false
}
</script>
