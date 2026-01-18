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

    <!-- 云端同步 -->
    <div class="card mb-6">
      <h3 class="font-medium text-calm-800 mb-3 flex items-center">
        <span class="mr-2">☁️</span>
        云端同步
      </h3>
      <p class="text-sm text-calm-500 mb-4">用于备份与恢复本地数据</p>

      <div v-if="!authStore.isAuthenticated">
        <p class="text-calm-600 mb-4">
          登录后可将你的数据备份到云端，用于多设备恢复或防止数据丢失。
        </p>
        <button @click="showLoginModal = true" class="btn-primary w-full">登录 / 注册</button>
      </div>

      <div v-else>
        <div class="mb-4">
          <p class="text-sm text-calm-600">已登录：{{ authStore.user?.email }}</p>
          <p v-if="lastSyncTime" class="text-xs text-calm-400 mt-1">
            上次云端更新时间：{{ formatDate(lastSyncTime) }}
          </p>
          <p v-else-if="authStore.hasCloudData" class="text-xs text-calm-400 mt-1">
            云端有备份数据
          </p>
          <p v-else class="text-xs text-calm-400 mt-1">云端暂无备份数据</p>
        </div>

        <div class="space-y-3">
          <button
            @click="handleUpload"
            :disabled="syncLoading"
            class="btn-primary w-full flex items-center justify-center"
          >
            <span v-if="syncLoading">上传中...</span>
            <span v-else>☁️ 上传到云端</span>
          </button>

          <button
            v-if="authStore.hasCloudData"
            @click="handleDownload"
            :disabled="syncLoading"
            class="btn-secondary w-full flex items-center justify-center"
          >
            <span v-if="syncLoading">下载中...</span>
            <span v-else>📥 从云端恢复</span>
          </button>

          <button
            @click="handleSignOut"
            :disabled="syncLoading"
            class="btn-secondary w-full text-sm border-calm-200"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>

    <!-- 应用信息 -->
    <div class="card">
      <h3 class="font-medium text-calm-800 mb-3">关于应用</h3>
      <div class="text-calm-600 text-sm space-y-2">
        <p>版本: 1.3.0</p>
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
    <!-- 登录弹窗 -->
    <LoginModal
      v-if="showLoginModal"
      :is-open="showLoginModal"
      @close="showLoginModal = false"
      @success="handleLoginSuccess"
    />
  </div>

  <!-- 通知容器 -->
  <NotificationContainer :notifications="notifications" @remove="removeNotification" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCloudSync } from '@/composables/useCloudSync'
import { useNotification } from '@/composables/useNotification'
import LoginModal from '@/components/LoginModal.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'
import type { Task } from '@/types'

const router = useRouter()
const store = useUrgeStore()
const authStore = useAuthStore()
const cloudSync = useCloudSync()
const { notifications, showSuccess, showError, removeNotification } = useNotification()

const showConfirmClear = ref(false)
const showLoginModal = ref(false)
const showConflictModal = ref(false)
const showRestoreConfirmModal = ref(false)
const syncLoading = ref(false)
const lastSyncTime = ref<number | null>(null)
const pendingUploadData = ref<any>(null)

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
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
}

const handleLoginSuccess = async () => {
  showLoginModal.value = false

  try {
    syncLoading.value = true
    if (authStore.user) {
      const backup = await cloudSync.getUserBackup(authStore.user.id)
      authStore.setHasCloudData(!!backup)
      if (backup?.updated_at) {
        lastSyncTime.value = new Date(backup.updated_at).getTime()
      }
    }
  } catch (err) {
    console.error('检查云端数据失败:', err)
  } finally {
    syncLoading.value = false
  }
}

const handleUpload = async () => {
  if (!authStore.user) return

  syncLoading.value = true
  try {
    const backupData = {
      tasks: store.tasks,
      urgeLogs: store.urgeLogs,
      checkInRecords: store.checkInRecords,
      lastSyncAt: Date.now()
    }

    const conflictCheck = await cloudSync.checkForConflicts(
      authStore.user.id,
      authStore.lastSyncTime || undefined
    )

    if (conflictCheck?.hasConflict) {
      pendingUploadData.value = backupData
      showConflictModal.value = true
      syncLoading.value = false
      return
    }

    const result = await cloudSync.uploadDataToCloud(authStore.user.id, backupData)
    if (result.success) {
      authStore.setLastSyncTime(Date.now())
      authStore.setHasCloudData(true)
      lastSyncTime.value = Date.now()
      showSuccess('云端备份成功！')
    } else {
      showError('上传失败: ' + result.error)
    }
  } catch (err) {
    console.error('上传失败:', err)
    showError('上传失败')
  } finally {
    syncLoading.value = false
  }
}

// @ts-ignore - used in template
const forceUpload = async () => {
  if (!authStore.user || !pendingUploadData.value) return

  showConflictModal.value = false
  syncLoading.value = true

  try {
    const result = await cloudSync.uploadDataToCloud(authStore.user.id, pendingUploadData.value)
    if (result.success) {
      authStore.setLastSyncTime(Date.now())
      authStore.setHasCloudData(true)
      lastSyncTime.value = Date.now()
      showSuccess('云端备份成功！')
    } else {
      showError('上传失败: ' + result.error)
    }
  } catch (err) {
    console.error('强制上传失败:', err)
    showError('上传失败')
  } finally {
    syncLoading.value = false
    pendingUploadData.value = null
  }
}

const handleDownload = async () => {
  if (!authStore.user) return

  const result = await cloudSync.downloadDataFromCloud(authStore.user.id)
  if (result.success && result.data) {
    pendingUploadData.value = result.data
    showRestoreConfirmModal.value = true
  } else {
    showError('下载失败: ' + result.error)
  }
}

// @ts-ignore - used in template
const confirmRestore = async () => {
  if (!pendingUploadData.value) return

  showRestoreConfirmModal.value = false
  syncLoading.value = true

  try {
    const { tasks, urgeLogs, checkInRecords } = pendingUploadData.value
    store.tasks = tasks
    store.urgeLogs = urgeLogs
    store.checkInRecords = checkInRecords

    authStore.setLastSyncTime(Date.now())
    lastSyncTime.value = Date.now()

    window.location.reload()
  } catch (err) {
    console.error('恢复数据失败:', err)
    showError('恢复失败')
  } finally {
    syncLoading.value = false
    pendingUploadData.value = null
  }
}

const handleSignOut = async () => {
  try {
    syncLoading.value = true
    const result = await authStore.signOut()
    if (result.success) {
      // 退出登录成功后重置相关状态
      showSuccess('已退出登录')
      // 重置本地状态变量
      lastSyncTime.value = null
    } else {
      showError('退出登录失败: ' + result.error)
    }
  } catch (err) {
    console.error('退出登录异常:', err)
    showError('退出登录失败')
  } finally {
    syncLoading.value = false
  }
}

onMounted(async () => {
  await authStore.initAuth()

  if (authStore.user) {
    try {
      syncLoading.value = true
      const backup = await cloudSync.getUserBackup(authStore.user.id)
      authStore.setHasCloudData(!!backup)
      if (backup?.updated_at) {
        lastSyncTime.value = new Date(backup.updated_at).getTime()
      }
    } catch (err) {
      console.error('初始化云端数据状态失败:', err)
    } finally {
      syncLoading.value = false
    }
  }
})
</script>
