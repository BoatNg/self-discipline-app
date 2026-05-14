<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-calm-800">倾诉选项管理</h3>
        <button @click="closeModal" class="text-calm-400 hover:text-calm-600 transition-colors">
          ✕
        </button>
      </div>

      <div class="flex-1 overflow-y-auto space-y-2 mb-4">
        <div v-for="option in store.dumpOptions" :key="option.id" class="flex items-center space-x-2">
          <button
            @click="startEdit(option)"
            class="flex-1 text-left py-2 px-3 border border-calm-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors truncate"
          >
            {{ option.text }}
          </button>
          <button
            @click="startDelete(option)"
            class="p-2 text-calm-400 hover:text-red-500 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      <!-- 添加/编辑表单 -->
      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <input
            v-model="currentText"
            type="text"
            required
            :placeholder="editingOption ? '编辑选项内容' : '添加新选项'"
            class="w-full px-4 py-2 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div class="flex space-x-3">
          <button type="submit" class="btn-primary flex-1">
            {{ editingOption ? '保存' : '添加' }}
          </button>
          <button
            v-if="editingOption"
            type="button"
            @click="cancelEdit"
            class="btn-secondary flex-1"
          >
            取消
          </button>
        </div>
      </form>

      <div class="mt-4">
        <button
          @click="showResetConfirm = true"
          class="w-full py-2 px-3 text-calm-600 hover:text-calm-800 border border-calm-200 rounded-lg hover:bg-calm-50 transition-colors"
        >
          恢复默认选项
        </button>
      </div>

      <!-- 删除确认 -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showDeleteConfirm = false"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-md">
          <div class="text-6xl text-red-500 mb-4 text-center">⚠️</div>
          <h3 class="text-lg font-medium text-calm-800 mb-2 text-center">确认删除</h3>
          <p class="text-calm-600 text-center mb-6">「{{ optionToDelete?.text }}」</p>
          <div class="flex space-x-3">
            <button @click="showDeleteConfirm = false" class="btn-secondary flex-1">取消</button>
            <button @click="confirmDelete" class="btn-primary flex-1 bg-red-500 hover:bg-red-600">
              确认删除
            </button>
          </div>
        </div>
      </div>

      <!-- 重置确认 -->
      <div
        v-if="showResetConfirm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showResetConfirm = false"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-md">
          <div class="text-6xl text-yellow-500 mb-4 text-center">⚠️</div>
          <h3 class="text-lg font-medium text-calm-800 mb-2 text-center">恢复默认选项</h3>
          <p class="text-calm-600 text-center mb-6">
            这将重置所有倾诉选项，您的自定义选项会被删除。确定继续吗？
          </p>
          <div class="flex space-x-3">
            <button @click="showResetConfirm = false" class="btn-secondary flex-1">取消</button>
            <button @click="confirmReset" class="btn-primary flex-1 bg-primary-500">
              确认重置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUrgeStore } from '@/stores/useUrgeStore'
import type { DumpOption } from '@/types'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const store = useUrgeStore()

const currentText = ref('')
const editingOption = ref<DumpOption | null>(null)
const optionToDelete = ref<DumpOption | null>(null)
const showDeleteConfirm = ref(false)
const showResetConfirm = ref(false)

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  currentText.value = ''
  editingOption.value = null
  optionToDelete.value = null
  showDeleteConfirm.value = false
  showResetConfirm.value = false
}

const startEdit = (option: DumpOption) => {
  editingOption.value = option
  currentText.value = option.text
}

const cancelEdit = () => {
  editingOption.value = null
  currentText.value = ''
}

const startDelete = (option: DumpOption) => {
  optionToDelete.value = option
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (optionToDelete.value) {
    store.deleteDumpOption(optionToDelete.value.id)
  }
  showDeleteConfirm.value = false
  optionToDelete.value = null
}

const confirmReset = () => {
  store.resetDumpOptions()
  showResetConfirm.value = false
}

const handleSubmit = () => {
  if (!currentText.value.trim()) return

  if (editingOption.value) {
    store.editDumpOption(editingOption.value.id, currentText.value.trim())
  } else {
    store.addDumpOption(currentText.value.trim())
  }

  resetForm()
}
</script>
