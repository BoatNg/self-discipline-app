<template>
  <div class="min-h-screen bg-calm-50">
    <header v-if="showHeader" class="sticky top-0 z-10 bg-white shadow-sm">
      <div class="container mx-auto px-4 py-3">
        <h1 class="text-xl font-semibold text-calm-800">{{ currentTitle }}</h1>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6" :class="{ 'pb-20': showNavigation }">
      <router-view />
    </main>

    <nav
      v-if="showNavigation"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-calm-200"
    >
      <div class="flex justify-around items-center h-16">
        <router-link
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center w-20"
          :class="{ 'text-primary-500': item.isActive }"
        >
          <div class="text-2xl mb-1">{{ item.icon }}</div>
          <span class="text-xs">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
    <PWAStatus />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'
import PWAStatus from '@/components/PWAStatus.vue'

const route = useRoute()
const store = useUrgeStore()

const currentTitle = computed(() => {
  return (route.meta.title as string) || '我不要'
})

const showHeader = computed(() => {
  return !store.isInIntervention && route.name !== 'intervention'
})

const showNavigation = computed(() => {
  return !store.isInIntervention && route.name !== 'intervention'
})

const navigationItems = computed(() => {
  return [
    {
      to: '/',
      label: '首页',
      icon: '🏠',
      isActive: route.name === 'home'
    },
    {
      to: '/history',
      label: '记录',
      icon: '📊',
      isActive: route.name === 'history'
    },
    {
      to: '/settings',
      label: '设置',
      icon: '⚙️',
      isActive: route.name === 'settings'
    }
  ]
})
</script>

<style scoped>
.router-link-active {
  @apply text-primary-500 font-medium;
}

.router-link-exact-active {
  @apply text-primary-600;
}
</style>
