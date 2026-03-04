import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES } from '../route-names'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: ROUTE_NAMES.HOMEPAGE,
    component: () => import('@/interface/views/HomeView.vue'),
    meta: { label: 'Accueil' },
  },
  {
    path: 'contact',
    name: ROUTE_NAMES.CONTACT,
    component: () => import('@/interface/views/ContactView.vue'),
    meta: { label: 'Contact' },
  },
  {
    path: 'cgu',
    alias: ['tos', 'terms-of-service'],
    name: ROUTE_NAMES.CGU,
    component: () => import('@/interface/views/CguView.vue'),
    meta: { label: 'CGU' },
  },
  {
    path: '/mentions-legales',
    alias: ['/legal-notice', '/legal-mentions'],
    name: ROUTE_NAMES.LEGAL_NOTICE,
    component: () => import('@/interface/views/MentionsLegalesView.vue'),
    meta: { label: 'Mentions légales' },
  },
]
