<template>
  <div class="flex flex-col min-h-[calc(100vh-120px)]">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-calm-800 mb-6">创建新任务</h2>

      <!-- 表单 -->
      <div class="space-y-6">
        <!-- 任务名称 -->
        <div>
          <label class="block text-sm font-medium text-calm-700 mb-2">任务名称</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="例如：每天读书30分钟"
            class="w-full p-3 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <!-- 任务类型 -->
        <div>
          <label class="block text-sm font-medium text-calm-700 mb-2">任务类型</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="form.type = 'DO_WANT'"
              :class="{
                'border-green-500 bg-green-50 text-green-800': form.type === 'DO_WANT',
                'border-calm-200 bg-white text-calm-800 hover:border-green-300 hover:bg-green-50':
                  form.type !== 'DO_WANT'
              }"
              class="p-4 rounded-xl border-2 text-center transition-all duration-200"
            >
              <div class="text-2xl mb-2">💪</div>
              <div class="font-medium">修</div>
              <div class="text-xs text-calm-500 mt-1">目标打卡</div>
            </button>

            <button
              @click="form.type = 'DONT_WANT'"
              :class="{
                'border-orange-500 bg-orange-50 text-orange-800': form.type === 'DONT_WANT',
                'border-calm-200 bg-white text-calm-800 hover:border-orange-300 hover:bg-orange-50':
                  form.type !== 'DONT_WANT'
              }"
              class="p-4 rounded-xl border-2 text-center transition-all duration-200"
            >
              <div class="text-2xl mb-2">🚫</div>
              <div class="font-medium">克</div>
              <div class="text-xs text-calm-500 mt-1">冲动控制</div>
            </button>
          </div>
        </div>

        <!-- 任务周期 -->
        <div>
          <label class="block text-sm font-medium text-calm-700 mb-2">任务周期</label>
          <div class="space-y-4">
            <!-- 开始日期 -->
            <div>
              <label class="block text-xs text-calm-600 mb-1">开始日期</label>
              <input
                v-model="form.startDate"
                type="date"
                class="w-full p-3 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            <!-- 结束日期 -->
            <div>
              <label class="block text-xs text-calm-600 mb-1">结束日期</label>
              <input
                v-model="form.endDate"
                type="date"
                class="w-full p-3 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            <!-- 总天数显示 -->
            <div class="pt-2">
              <div class="text-xs text-calm-500">
                任务周期：<span class="font-medium text-calm-700">{{ totalDays }}</span> 天
              </div>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- 按钮区域 -->
    <div class="mt-auto space-y-3">
      <button
        @click="createTask"
        :disabled="!isFormValid || isCreating"
        class="w-full p-4 rounded-2xl bg-green-500 text-white text-center font-medium transition-all duration-200 hover:bg-green-600 disabled:bg-calm-300 disabled:cursor-not-allowed"
      >
        <span v-if="isCreating">创建中...</span>
        <span v-else>创建任务</span>
      </button>

      <button
        @click="cancel"
        class="w-full p-4 rounded-2xl border-2 border-calm-200 bg-white text-calm-800 text-center transition-all duration-200 hover:border-calm-300 hover:bg-calm-50"
      >
        取消
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import type { TaskType } from '@/types'

const router = useRouter()
const store = useUrgeStore()

// 表单数据
const form = ref({
  name: '',
  type: 'DO_WANT' as TaskType,
  startDate: '',
  endDate: ''
})

const isCreating = ref(false)
const errorMessage = ref('')

// 计算总天数
const totalDays = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 0

  const start = new Date(form.value.startDate).getTime()
  const end = new Date(form.value.endDate).getTime()

  if (end <= start) return 0

  return Math.ceil((end - start) / (24 * 60 * 60 * 1000))
})

// 表单验证
const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    form.value.startDate !== '' &&
    form.value.endDate !== '' &&
    totalDays.value > 0
  )
})

// 初始化日期
onMounted(() => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextMonth = new Date(today)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  // 设置默认开始日期为今天
  form.value.startDate = formatDateForInput(today)
  // 设置默认结束日期为一个月后
  form.value.endDate = formatDateForInput(nextMonth)
})

// 格式化日期为YYYY-MM-DD
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 创建任务
const createTask = async () => {
  if (!isFormValid.value) return

  errorMessage.value = ''
  isCreating.value = true

  try {
    // 验证日期
    const startDateObj = new Date(form.value.startDate)
    const endDateObj = new Date(form.value.endDate)
    startDateObj.setHours(0, 0, 0, 0)
    endDateObj.setHours(0, 0, 0, 0)
    const startTimestamp = startDateObj.getTime()
    const endTimestamp = endDateObj.getTime()

    if (endTimestamp <= startTimestamp) {
      throw new Error('结束日期必须晚于开始日期')
    }

    // 创建任务
    store.addTask(
      form.value.name.trim(),
      form.value.type,
      startTimestamp,
      endTimestamp,
      'DAILY', // 默认频率为每日
      undefined // 自定义天数
    )

    // 显示成功提示
    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '创建任务失败'
  } finally {
    isCreating.value = false
  }
}

// 取消
const cancel = () => {
  router.push('/')
}
</script>

<style scoped>
/* 自定义样式 */
</style>
