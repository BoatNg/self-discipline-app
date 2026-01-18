import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { AuthError } from '@supabase/supabase-js'
import type { AuthResult } from '@/types'

export function useAuth() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    isLoading.value = true
    error.value = null

    try {
      const emailRedirectTo = `${window.location.origin}/auth/callback`
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      // Supabase signUp 会返回用户对象，但 email_confirmed_at 通常为 null
      // 如果启用了邮箱验证，用户需要验证后才能登录
      const needsEmailVerification = !data.user?.email_confirmed_at
      return {
        success: true,
        user: data.user,
        needsEmailVerification,
        emailConfirmed: !!data.user?.email_confirmed_at
      }
    } catch (err) {
      error.value = (err as AuthError).message || '注册失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        throw new Error(authError.message)
      }

      return { success: true, user: data.user }
    } catch (err) {
      error.value = (err as AuthError).message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.signOut()
      if (authError) {
        throw new Error(authError.message)
      }
      return { success: true }
    } catch (err) {
      error.value = (err as AuthError).message || '登出失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const getCurrentUser = async () => {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      return user
    } catch (err) {
      console.error('获取当前用户失败:', err)
      return null
    }
  }

  const resetPasswordForEmail = async (email: string): Promise<AuthResult> => {
    isLoading.value = true
    error.value = null

    try {
      const redirectTo = `${window.location.origin}/auth/update-password`
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      })

      if (authError) {
        throw new Error(authError.message)
      }

      return { success: true, user: null }
    } catch (err) {
      error.value = (err as AuthError).message || '发送重置密码邮件失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateUserPassword = async (newPassword: string): Promise<AuthResult> => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (authError) {
        throw new Error(authError.message)
      }

      return { success: true, user: data.user }
    } catch (err) {
      error.value = (err as AuthError).message || '更新密码失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    resetPasswordForEmail,
    updateUserPassword
  }
}
