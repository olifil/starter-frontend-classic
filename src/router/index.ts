import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    label?: string
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}
import { publicRoutes } from '@/router/childs/public.routes'
import { authRoutes } from '@/router/childs/auth.routes'
import { userRoutes } from './childs/user.routes'
import { useAuthStore } from '@/interface/stores/auth.store'
import { useLayoutStore } from '@/interface/stores/layout.store'
import { ROUTE_NAMES } from './route-names'
import type { RouteRecordRaw } from 'vue-router'

const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: ROUTE_NAMES.NOT_FOUND,
  component: () => import('@/interface/views/exceptions/404View.vue'),
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/interface/layouts/DefaultLayout.vue'),
    children: [...publicRoutes, ...authRoutes, ...userRoutes, notFoundRoute],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: ROUTE_NAMES.LOGIN }
  }
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: ROUTE_NAMES.HOMEPAGE }
  }
})

router.afterEach(() => {
  useLayoutStore().resetPageMeta()
})

export default router
