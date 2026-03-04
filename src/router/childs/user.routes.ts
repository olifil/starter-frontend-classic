import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES } from '../route-names'

export const userRoutes: RouteRecordRaw[] = [
  {
    path: 'profil',
    alias: 'profile',
    name: ROUTE_NAMES.PROFILE,
    component: () => import('@/interface/views/ProfileView.vue'),
    meta: { label: 'Profil' },
  },
  {
    path: '/notifications',
    name: ROUTE_NAMES.NOTIFICATIONS,
    component: () => import('@/interface/views/NotificationsView.vue'),
    meta: { label: 'Notifications', requiresAuth: true },
  },
]
