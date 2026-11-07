import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/tasks' },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('@/views/TasksView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks/:id(\\d+)',
      name: 'task-detail',
      component: () => import('@/views/TaskDetailView.vue'),
      props: (route) => ({ id: Number(route.params.id) }),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: { requiresAuth: true, adminOnly: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/tasks' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.fetchUser()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.adminOnly && !auth.isAdmin) {
    return { name: 'tasks' }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'tasks' }
  }
})

export default router
