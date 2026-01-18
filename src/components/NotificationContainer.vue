<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col space-y-3 max-w-sm">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="rounded-xl shadow-lg p-4 flex items-start border transform transition-all duration-300"
        :class="{
          'bg-green-50 border-green-200': notification.type === 'success',
          'bg-red-50 border-red-200': notification.type === 'error',
          'bg-yellow-50 border-yellow-200': notification.type === 'warning',
          'bg-blue-50 border-blue-200': notification.type === 'info'
        }"
      >
        <!-- 图标 -->
        <div class="mr-3 mt-0.5 flex-shrink-0">
          <span v-if="notification.type === 'success'" class="text-green-500 text-xl"> ✅ </span>
          <span v-else-if="notification.type === 'error'" class="text-red-500 text-xl"> ⚠️ </span>
          <span v-else-if="notification.type === 'warning'" class="text-yellow-500 text-xl">
            ⚠️
          </span>
          <span v-else class="text-blue-500 text-xl"> ℹ️ </span>
        </div>

        <!-- 内容 -->
        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-medium"
            :class="{
              'text-green-700': notification.type === 'success',
              'text-red-700': notification.type === 'error',
              'text-yellow-700': notification.type === 'warning',
              'text-blue-700': notification.type === 'info'
            }"
          >
            {{ notification.message }}
          </p>
        </div>

        <!-- 关闭按钮 -->
        <button
          @click="$emit('remove', notification.id)"
          class="ml-2 flex-shrink-0 text-calm-400 hover:text-calm-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface Props {
  notifications: Notification[]
}

defineProps<Props>()
defineEmits<{
  remove: [id: number]
}>()
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
