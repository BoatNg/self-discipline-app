<template>
  <div class="flex flex-col min-h-[calc(100vh-200px)]">
    <div class="flex items-center justify-between mb-4">
      <button @click="goBack" class="text-calm-500 hover:text-calm-700 flex items-center gap-1 text-sm">
        &larr; 返回
      </button>
      <div class="flex items-center gap-2">
        <button @click="handleDelete" v-if="isEditing" class="px-3 py-1.5 text-sm text-calm-500 hover:text-red-500 rounded-lg transition-colors">
          删除
        </button>
        <button @click="handleSave" class="btn-primary text-sm px-4 py-1.5">
          {{ isEditing ? '保存' : '写下' }}
        </button>
      </div>
    </div>

    <div class="card flex-1 flex flex-col">
      <NianEditor
        v-model="content"
        v-model:mood="mood"
        v-model:tags="tags"
        :showToolbar="true"
        :showFooter="true"
        placeholder="记录下此刻的感悟、经验、思考……"
      />
    </div>

    <div v-if="showSaved" class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-calm-800 text-white px-4 py-2 rounded-lg text-sm animate-fade-in">
      {{ isEditing ? '已保存' : '已写下这一念' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import NianEditor from '@/components/NianEditor.vue'
import type { NianMood } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useUrgeStore()

const isEditing = ref(false)
const nianId = ref<string | null>(null)
const content = ref('')
const mood = ref<NianMood>('neutral')
const tags = ref<string[]>([])
const showSaved = ref(false)

onMounted(() => {
  const id = route.params.id as string
  if (id && id !== 'new') {
    const nian = store.getNian(id)
    if (nian) {
      isEditing.value = true
      nianId.value = nian.id
      content.value = nian.content
      mood.value = nian.mood
      tags.value = [...nian.tags]
    } else {
      router.replace('/nian/new')
    }
  }
})

const goBack = () => {
  router.push('/nian')
}

const handleSave = () => {
  const text = content.value.trim()
  if (!text || text === '<p></p>') {
    alert('写点什么吧')
    return
  }

  if (isEditing.value && nianId.value) {
    store.updateNian(nianId.value, { content: text, mood: mood.value, tags: [...tags.value] })
  } else {
    store.addNian(text, mood.value, [...tags.value])
  }
  showSavedToast()
  setTimeout(() => router.push('/nian'), 800)
}

const handleDelete = () => {
  if (!nianId.value) return
  if (confirm('确定要删除这一念吗？')) {
    store.deleteNian(nianId.value)
    router.push('/nian')
  }
}

const showSavedToast = () => {
  showSaved.value = true
  setTimeout(() => { showSaved.value = false }, 2000)
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>