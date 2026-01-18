import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { AuthError } from '@supabase/supabase-js'

export function useAuth() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const signUp = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) {
        throw new Error(authError.message)
      }

      return { success: true, user: data.user }
    } catch (err) {
      error.value = (err as AuthError).message || '注册失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
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

  return {
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    getCurrentUser
  }
}
