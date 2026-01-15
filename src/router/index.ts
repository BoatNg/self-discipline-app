import { createRouter, createWebHistory } from 'vue-router'
import { useUrgeStore } from '@/stores/useUrgeStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/intervention',
      name: 'intervention',
      component: () => import('@/views/InterventionView.vue'),
      meta: { title: '冲动干预', requiresIntervention: true }
    },
    {
      path: '/result',
      name: 'result',
      component: () => import('@/views/ResultView.vue'),
      meta: { title: '结果记录', requiresIntervention: true }
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue'),
      meta: { title: '历史记录' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: '设置' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, _, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 我不要` : '我不要'

  if (to.meta.requiresIntervention) {
    const store = useUrgeStore()

    // 允许访问/intervention来初始化状态，但阻止直接访问/result
    if (to.name === 'result' && !store.isInIntervention) {
      console.log('阻止直接访问结果页面')
      next('/')
      return
    }

    // /intervention 页面会在mounted中设置isInIntervention为true
  }

  next()
})

export default router
