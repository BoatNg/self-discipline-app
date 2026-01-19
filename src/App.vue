<template>
  <div class="min-h-screen bg-calm-50" style="overscroll-behavior: none;">
    <header v-if="showHeader" class="sticky top-0 z-10 bg-white shadow-sm safe-top">
      <div class="container mx-auto px-4 py-3">
        <h1 class="text-xl font-semibold text-calm-800">{{ currentTitle }}</h1>
      </div>
    </header>
    <div style="padding-top: 0.8rem"></div>
    <main
      class="container mx-auto px-4 safe-bottom"
      :class="{
        'pb-with-button': showNavigation && route.name === 'home',
        'pb-with-nav': showNavigation && route.name !== 'home'
      }"
    >
      <router-view />
    </main>

    <nav
      v-if="showNavigation"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-calm-200 navigation-safe nav-height-safe"
    >
      <div class="flex justify-around items-center">
        <router-link
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center w-20 py-2"
          :class="{ 'text-primary-500': item.isActive }"
        >
          <div class="text-2xl mb-1">{{ item.icon }}</div>
          <span class="text-xs">{{ item.label }}</span>
        </router-link>
      </div>
    </nav >
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
