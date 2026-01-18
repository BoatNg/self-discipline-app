<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-2xl p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-calm-800">
          {{ isForgotPassword ? '重置密码' : isLogin ? '登录' : '注册' }}
        </h2>
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

          <div v-if="!isForgotPassword">
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

          <div v-if="!isLogin && !isForgotPassword">
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
          <div
            class="text-sm px-4 py-3 rounded-lg flex items-start"
            :class="{
              'bg-red-50 text-red-600': error.includes('失败') || error.includes('错误'),
              'bg-green-50 text-green-600': !error.includes('失败') && !error.includes('错误')
            }"
          >
            <div class="mr-2">{{ error.includes('成功') ? '✅' : '⚠️' }}</div>
            <div>{{ error }}</div>
          </div>
        </div>

        <div class="flex space-x-3 mb-4">
          <button type="submit" class="btn-primary flex-1" :disabled="isLoading || !isFormValid">
            <span v-if="isLoading">处理中...</span>
            <span v-else>{{ isForgotPassword ? '发送重置邮件' : isLogin ? '登录' : '注册' }}</span>
          </button>
        </div>

        <div class="text-center space-y-2">
          <div v-if="!isForgotPassword">
            <button
              type="button"
              @click="toggleMode"
              class="text-sm text-primary-600 hover:text-primary-800 transition-colors"
              :disabled="isLoading"
            >
              {{ isLogin ? '还没有账号？立即注册' : '已有账号？立即登录' }}
            </button>
          </div>
          <div>
            <button
              type="button"
              @click="toggleForgotPassword"
              class="text-sm text-primary-600 hover:text-primary-800 transition-colors"
              :disabled="isLoading"
            >
              {{ isForgotPassword ? '返回登录' : '忘记密码？' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAuth } from '@/composables/useAuth'

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
const { resetPasswordForEmail } = useAuth()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const isForgotPassword = ref(false)

const isFormValid = computed(() => {
  if (isForgotPassword.value) {
    return !!email.value
  }
  if (!email.value || !password.value) return false
  if (!isLogin.value && password.value !== confirmPassword.value) return false
  if (password.value.length < 6) return false
  return true
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  isForgotPassword.value = false
  error.value = null
  password.value = ''
  confirmPassword.value = ''
}

const toggleForgotPassword = () => {
  isForgotPassword.value = !isForgotPassword.value
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
  isForgotPassword.value = false
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = null

  try {
    if (isForgotPassword.value) {
      // 处理忘记密码
      const result = await resetPasswordForEmail(email.value)
      if (result.success) {
        // 显示绿色成功提示
        error.value = '重置密码邮件已发送，请检查邮箱并按指引操作。'
        // 清空输入
        email.value = ''
        // 切换回登录模式
        isForgotPassword.value = false
      } else {
        error.value = result.error || '发送重置密码邮件失败'
      }
      return
    }

    let result
    if (isLogin.value) {
      result = await authStore.signIn(email.value, password.value)
    } else {
      result = await authStore.signUp(email.value, password.value)
    }

    if (result.success) {
      if (isLogin.value) {
        // 登录成功：正常流程
        emit('success')
        closeModal()
      } else {
        // 注册成功：显示验证提醒
        if (result.needsEmailVerification) {
          // 显示绿色成功提示
          error.value = '注册成功！请检查邮箱完成验证。验证后可登录。'
          // 保留邮箱（显示成功），清空密码
          password.value = ''
          confirmPassword.value = ''
          isLogin.value = true
          // 不触发 success，不关闭弹窗
          // 用户可以切换登录模式或手动关闭
        } else {
          // 邮箱已验证（理论上不会到这里，但保留逻辑）
          emit('success')
          closeModal()
        }
      }
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
