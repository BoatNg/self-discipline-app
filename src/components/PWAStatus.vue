<template>
  <div
    v-if="showDebug"
    class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-xs z-50 border border-calm-200 pwa-debug-safe ios-action-safe"
  >
    <div class="text-sm font-medium text-calm-800 mb-2">PWA状态调试</div>

    <div class="space-y-2 text-xs">
      <div class="flex justify-between">
        <span class="text-calm-600">Service Worker:</span>
        <span :class="{ 'text-green-600': swRegistered, 'text-red-600': !swRegistered }">
          {{ swRegistered ? '已注册' : '未注册' }}
        </span>
      </div>

      <div class="flex justify-between">
        <span class="text-calm-600">PWA可安装:</span>
        <span :class="{ 'text-green-600': isInstallable, 'text-yellow-600': !isInstallable }">
          {{ isInstallable ? '可安装' : '检查中' }}
        </span>
      </div>

      <div class="flex justify-between">
        <span class="text-calm-600">Manifest加载:</span>
        <span :class="{ 'text-green-600': manifestLoaded, 'text-red-600': !manifestLoaded }">
          {{ manifestLoaded ? '已加载' : '未加载' }}
        </span>
      </div>

      <div class="flex justify-between">
        <span class="text-calm-600">离线支持:</span>
        <span :class="{ 'text-green-600': supportsOffline, 'text-red-600': !supportsOffline }">
          {{ supportsOffline ? '支持' : '不支持' }}
        </span>
      </div>

      <div class="mt-3 pt-2 border-t border-calm-200">
        <button
          @click="triggerInstall"
          v-if="deferredPrompt"
          class="w-full btn-primary py-2 text-sm"
        >
          安装应用
        </button>

        <button
          @click="showDebug = false"
          class="w-full mt-2 text-calm-500 hover:text-calm-700 text-xs"
        >
          隐藏调试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showDebug = ref(import.meta.env.DEV) // 仅开发环境显示
const swRegistered = ref(false)
const manifestLoaded = ref(false)
const isInstallable = ref(false)
const supportsOffline = ref(false)
const deferredPrompt = ref<any>(null)

const checkServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        swRegistered.value = registrations.length > 0
        console.log('Service Worker注册状态:', swRegistered.value)
      })
      .catch((err) => {
        console.error('检查Service Worker失败:', err)
      })
  }
}

const checkManifest = () => {
  const manifestLink = document.querySelector('link[rel="manifest"]')
  manifestLoaded.value = !!manifestLink

  if (manifestLink) {
    fetch('/manifest.json')
      .then((response) => {
        if (response.ok) {
          console.log('Manifest文件可访问')
          manifestLoaded.value = true
        }
      })
      .catch((err) => {
        console.error('Manifest加载失败:', err)
      })
  }
}

const checkOfflineSupport = () => {
  supportsOffline.value = 'serviceWorker' in navigator && 'Cache' in window
}

// 监听PWA安装提示
const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  deferredPrompt.value = e
  isInstallable.value = true
  console.log('PWA可安装提示已触发')
}

const triggerInstall = () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    deferredPrompt.value.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('用户接受了PWA安装')
      } else {
        console.log('用户拒绝了PWA安装')
      }
      deferredPrompt.value = null
      isInstallable.value = false
    })
  }
}

onMounted(() => {
  // 初始检查
  checkServiceWorker()
  checkManifest()
  checkOfflineSupport()

  // 监听安装提示
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

  // 定期检查
  setInterval(() => {
    checkServiceWorker()
  }, 10000)

  // 监听service worker更新
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker控制器已更新')
      swRegistered.value = true
    })
  }
})

// 清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})
</script>
