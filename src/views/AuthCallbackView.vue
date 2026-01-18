<template>
  <div class="auth-callback">
    <div v-if="loading" class="status">正在验证身份...</div>
    <div v-else-if="error" class="status error">❌ {{ error }}</div>
    <div v-else class="status success">✅ 身份验证成功！</div>

    <div v-if="!loading && !error" class="countdown">将在 {{ countdown }} 秒后自动跳转到首页</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'vue-router'

const loading = ref(true)
const error = ref<string | null>(null)
const countdown = ref(3)
const router = useRouter()

onMounted(async () => {
  try {
    // 从 URL 中提取 token 并完成登录
    // getSession() 会自动处理 URL 中的 access_token 参数
    const {
      data: { session },
      error: authError
    } = await supabase.auth.getSession()

    if (authError) {
      throw new Error(authError.message || '认证失败')
    }

    if (!session) {
      throw new Error('未获取到有效的会话信息')
    }

    // 清除 URL 中的敏感参数（美观 + 安全）
    window.history.replaceState({}, document.title, window.location.pathname)

    // 开始倒计时
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        router.push('/')
      }
    }, 1000)
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = (err as Error).message || '未知错误，请重试。'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.auth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.status {
  font-size: 1.2rem;
  margin-bottom: 16px;
  text-align: center;
}

.success {
  color: #10b981;
}

.error {
  color: #ef4444;
}

.countdown {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 8px;
  text-align: center;
}
</style>
