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
      name: 'history-overview',
      component: () => import('@/views/HistoryOverviewView.vue'),
      meta: { title: '记录总览' }
    },
    {
      path: '/history/detail',
      name: 'history-detail',
      component: () => import('@/views/HistoryDetailView.vue'),
      meta: { title: '历史记录' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: '设置' }
    },
    {
      path: '/checkin/:taskId',
      name: 'checkin',
      component: () => import('@/views/CheckInView.vue'),
      meta: { title: '每日打卡' }
    },
    {
      path: '/task/create',
      name: 'task-create',
      component: () => import('@/views/TaskCreateView.vue'),
      meta: { title: '创建任务' }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/AuthCallbackView.vue'),
      meta: { title: '认证回调', public: true }
    },
    {
      path: '/auth/update-password',
      name: 'auth-update-password',
      component: () => import('@/views/AuthUpdatePasswordView.vue'),
      meta: { title: '重置密码', public: true }
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
