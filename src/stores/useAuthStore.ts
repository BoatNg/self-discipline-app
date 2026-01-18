import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/utils/supabase'

interface User {
  id: string
  email: string
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<User | null>(null)
    const isLoading = ref(false)
    const lastSyncTime = ref<number | null>(null)
    const hasCloudData = ref(false)

    const {
      signUp: signUpAuth,
      signIn: signInAuth,
      signOut: signOutAuth,
      getCurrentUser
    } = useAuth()

    const isAuthenticated = computed(() => !!user.value)

    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          user.value = {
            id: currentUser.id,
            email: currentUser.email || ''
          }
        }
      } catch (err) {
        console.error('初始化认证失败:', err)
      }
    }

    const signUp = async (email: string, password: string) => {
      isLoading.value = true
      const result = await signUpAuth(email, password)

      if (result.success && result.user) {
        user.value = {
          id: result.user.id,
          email: result.user.email || ''
        }
      }

      isLoading.value = false
      return result
    }

    const signIn = async (email: string, password: string) => {
      isLoading.value = true
      const result = await signInAuth(email, password)

      if (result.success && result.user) {
        user.value = {
          id: result.user.id,
          email: result.user.email || ''
        }
      }

      isLoading.value = false
      return result
    }

    const signOut = async () => {
      isLoading.value = true
      const result = await signOutAuth()

      if (result.success) {
        user.value = null
        lastSyncTime.value = null
        hasCloudData.value = false
      }

      isLoading.value = false
      return result
    }

    const setLastSyncTime = (timestamp: number) => {
      lastSyncTime.value = timestamp
    }

    const setHasCloudData = (hasData: boolean) => {
      hasCloudData.value = hasData
    }

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        user.value = {
          id: session.user.id,
          email: session.user.email || ''
        }
      } else if (event === 'SIGNED_OUT') {
        user.value = null
        lastSyncTime.value = null
        hasCloudData.value = false
      }
    })

    return {
      user,
      isLoading,
      lastSyncTime,
      hasCloudData,
      isAuthenticated,
      initAuth,
      signUp,
      signIn,
      signOut,
      setLastSyncTime,
      setHasCloudData
    }
  },
  {
    persist: {
      key: 'self-discipline-app-auth',
      paths: ['user', 'lastSyncTime', 'hasCloudData']
    }
  }
)
