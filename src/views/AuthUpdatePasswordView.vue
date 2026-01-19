<template>
  <div class="auth-update-password bg-calm-50 flex flex-col" style="min-height: 80vh">
    <div class="container max-w-md mx-auto px-4 py-8 flex-grow flex flex-col">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-semibold text-calm-800 mb-2">重置密码</h1>
        <p class="text-calm-600">请输入新的密码</p>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm flex-grow flex flex-col">
        <form @submit.prevent="handleSubmit" class="space-y-6 flex-grow">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-calm-700 mb-2"
              >新密码</label
            >
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              required
              class="w-full px-4 py-3 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="至少6个字符"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-calm-700 mb-2"
              >确认新密码</label
            >
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-4 py-3 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="再次输入新密码"
              :disabled="isLoading"
            />
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

          <div class="pt-4 mt-auto">
            <button
              type="submit"
              class="btn-primary w-full py-3"
              :disabled="isLoading || !isFormValid"
            >
              <span v-if="isLoading">处理中...</span>
              <span v-else>重置密码</span>
            </button>

            <div class="mt-6 text-center">
              <router-link
                to="/"
                class="text-sm text-calm-500 hover:text-calm-700 transition-colors inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                返回首页
              </router-link>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/utils/supabase'

const router = useRouter()
const { updateUserPassword } = useAuth()

const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const isAuthenticated = ref(false)

const isFormValid = computed(() => {
  if (!newPassword.value || !confirmPassword.value) return false
  if (newPassword.value !== confirmPassword.value) return false
  if (newPassword.value.length < 6) return false
  return true
})

onMounted(async () => {
  try {
    // 检查用户是否已登录（通过邮箱验证链接会带有session）
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      error.value = '请先通过邮箱验证链接访问此页面'
      return
    }

    isAuthenticated.value = true
  } catch (err) {
    console.error('检查认证状态失败:', err)
    error.value = '检查认证状态失败，请重试'
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value || !isAuthenticated.value) return

  isLoading.value = true
  error.value = null

  try {
    const result = await updateUserPassword(newPassword.value)
    if (result.success) {
      error.value = '密码重置成功！请使用新密码登录。'
      // 清除表单
      newPassword.value = ''
      confirmPassword.value = ''

      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } else {
      error.value = result.error || '重置密码失败'
    }
  } catch (err) {
    error.value = '发生未知错误'
    console.error('重置密码失败:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-update-password {
  min-height: 100vh;
}
</style>
