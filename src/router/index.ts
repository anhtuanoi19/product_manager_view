import { createRouter, createWebHistory } from 'vue-router'
import AdminView from '@/components/admin/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AdminView
    },
    {
      path: '/danh-muc',
      name: 'danh-muc',
      component: () => import('../views/CategoryView.vue')
    },
    {
      path: '/san-pham',
      name: 'san-pham',
      component: () => import('../views/ProductView.vue')
    }
  ]
})

export default router
