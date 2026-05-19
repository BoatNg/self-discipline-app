<template>
  <div class="flex flex-col min-h-[calc(100vh-200px)]">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-medium text-calm-800">我的念</h2>
      <button @click="goToNew" class="btn-primary text-sm px-4 py-2">
        + 写一念
      </button>
    </div>

    <div v-if="store.sortedNians.length === 0" class="flex-1 flex flex-col items-center justify-center text-center py-16">
      <div class="text-5xl mb-4">📝</div>
      <p class="text-calm-600 mb-2">还没有记录</p>
      <p class="text-calm-400 text-sm mb-6">写下你的第一念吧</p>
      <button @click="goToNew" class="btn-primary px-6 py-3">
        写一念
      </button>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="nian in store.sortedNians"
        :key="nian.id"
        @click="goToDetail(nian.id)"
        class="card cursor-pointer hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ moodIcon(nian.mood) }}</span>
            <span class="text-xs text-calm-400">{{ formatDate(nian.timestamp) }}</span>
          </div>
          <button
            @click.stop="handleDelete(nian)"
            class="text-calm-300 hover:text-red-400 transition-colors text-sm px-1"
          >
            &times;
          </button>
        </div>
        <div class="text-sm text-calm-700 leading-relaxed line-clamp-3" v-html="nian.content"></div>
        <div v-if="nian.tags.length > 0" class="flex flex-wrap gap-1.5 mt-3">
          <span
            v-for="tag in nian.tags"
            :key="tag"
            class="px-2 py-0.5 bg-calm-100 text-calm-600 rounded-full text-xs"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import type { NianMood, Nian } from '@/types'

const router = useRouter()
const store = useUrgeStore()

const moodIcon = (mood: NianMood): string => {
  const map: Record<NianMood, string> = {
    calm: '😌',
    happy: '😊',
    neutral: '😐',
    anxious: '😰',
    sad: '😢',
    angry: '😤'
  }
  return map[mood] || '😐'
}

const formatDate = (ts: number): string => {
  const d = new Date(ts)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${min}`
}

const goToNew = () => {
  router.push('/nian/new')
}

const goToDetail = (id: string) => {
  router.push(`/nian/${id}`)
}

const handleDelete = (nian: Nian) => {
  if (confirm('确定要删除这一念吗？')) {
    store.deleteNian(nian.id)
  }
}
</script>