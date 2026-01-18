import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Task, UrgeLog, CheckInRecord } from '@/types'

interface CloudBackupData {
  tasks: Task[]
  urgeLogs: UrgeLog[]
  checkInRecords: CheckInRecord[]
  lastSyncAt?: number
}

export function useCloudSync() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastBackupTime = ref<Date | null>(null)

  const getUserBackup = async (userId: string) => {
    try {
      const { data, error: dbError } = await supabase
        .from('user_backups')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (dbError) {
        if (dbError.code === 'PGRST116') {
          return null
        }
        throw new Error(dbError.message)
      }

      return data
    } catch (err) {
      console.error('获取云端备份失败:', err)
      throw err
    }
  }

  const uploadDataToCloud = async (userId: string, data: CloudBackupData) => {
    isLoading.value = true
    error.value = null

    try {
      const payload = {
        user_id: userId,
        data,
        updated_at: new Date().toISOString()
      }

      const { error: dbError } = await supabase
        .from('user_backups')
        .upsert(payload, { onConflict: 'user_id' })

      if (dbError) {
        throw new Error(dbError.message)
      }

      lastBackupTime.value = new Date()
      return { success: true }
    } catch (err) {
      error.value = (err as Error).message || '上传失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const downloadDataFromCloud = async (userId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const backup = await getUserBackup(userId)
      if (!backup) {
        error.value = '云端没有数据'
        return { success: false, error: error.value, data: null }
      }

      return { success: true, data: backup.data as CloudBackupData }
    } catch (err) {
      error.value = (err as Error).message || '下载失败'
      return { success: false, error: error.value, data: null }
    } finally {
      isLoading.value = false
    }
  }

  const checkForConflicts = async (userId: string, localLastSyncTime?: number) => {
    try {
      const backup = await getUserBackup(userId)
      if (!backup) return null

      const remoteUpdatedAt = new Date(backup.updated_at).getTime()

      if (localLastSyncTime && remoteUpdatedAt > localLastSyncTime) {
        return {
          hasConflict: true,
          remoteUpdatedAt: new Date(remoteUpdatedAt),
          localLastSyncTime: localLastSyncTime ? new Date(localLastSyncTime) : null
        }
      }

      return { hasConflict: false }
    } catch (err) {
      console.error('检查冲突失败:', err)
      return { hasConflict: false }
    }
  }

  return {
    isLoading,
    error,
    lastBackupTime,
    getUserBackup,
    uploadDataToCloud,
    downloadDataFromCloud,
    checkForConflicts
  }
}
