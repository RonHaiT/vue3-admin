import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import autoRoutes from './autoRoute'
import systemRoutes from './systemRoute'

// 手动注册的路由
const manualRoutes: RouteRecordRaw[] = [

  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
]

const routes = [...manualRoutes, ...autoRoutes, ...systemRoutes]
console.log('routes', routes);

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
