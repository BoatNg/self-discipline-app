<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-2xl p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-calm-800">{{ isLogin ? '登录' : '注册' }}</h2>
        <button @click="closeModal" class="text-calm-400 hover:text-calm-600 transition-colors">
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="space-y-4 mb-6">
          <div>
            <label for="email" class="block text-sm font-medium text-calm-700 mb-1">邮箱</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="your@email.com"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-calm-700 mb-1">密码</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="至少6个字符"
              :disabled="isLoading"
            />
          </div>

          <div v-if="!isLogin">
            <label for="confirmPassword" class="block text-sm font-medium text-calm-700 mb-1"
              >确认密码</label
            >
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-4 py-2 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="再次输入密码"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div v-if="error" class="mb-4">
          <div class="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg flex items-start">
            <div class="mr-2">⚠️</div>
            <div>{{ error }}</div>
          </div>
        </div>

        <div class="flex space-x-3 mb-4">
          <button type="submit" class="btn-primary flex-1" :disabled="isLoading || !isFormValid">
            <span v-if="isLoading">处理中...</span>
            <span v-else>{{ isLogin ? '登录' : '注册' }}</span>
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            @click="toggleMode"
            class="text-sm text-primary-600 hover:text-primary-800 transition-colors"
            :disabled="isLoading"
          >
            {{ isLogin ? '还没有账号？立即注册' : '已有账号？立即登录' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

const isFormValid = computed(() => {
  if (!email.value || !password.value) return false
  if (!isLogin.value && password.value !== confirmPassword.value) return false
  if (password.value.length < 6) return false
  return true
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = null
  password.value = ''
  confirmPassword.value = ''
}

const closeModal = () => {
  if (isLoading.value) return
  emit('close')
  resetForm()
}

const resetForm = () => {
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  error.value = null
  isLoading.value = false
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = null

  try {
    let result
    if (isLogin.value) {
      result = await authStore.signIn(email.value, password.value)
    } else {
      result = await authStore.signUp(email.value, password.value)
    }

    if (result.success) {
      emit('success')
      closeModal()
    } else {
      error.value = result.error || '操作失败'
    }
  } catch (err) {
    error.value = '发生未知错误'
    console.error('认证失败:', err)
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  resetForm
})
</script>
