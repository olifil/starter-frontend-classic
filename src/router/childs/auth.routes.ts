import { ROUTE_NAMES } from '@/router/route-names'
import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: 'connexion',
    alias: 'login',
    name: ROUTE_NAMES.LOGIN,
    meta: { guestOnly: true },
    component: () => import('@/interface/views/LoginView.vue'),
  },
  {
    path: 'inscription',
    alias: 'register',
    name: ROUTE_NAMES.REGISTER,
    meta: { guestOnly: true },
    component: () => import('@/interface/views/RegisterView.vue'),
  },
  {
    path: 'mot-de-passe-oublie',
    alias: 'forgot-password',
    name: ROUTE_NAMES.FORGOT_PASSWORD,
    meta: { guestOnly: true },
    component: () => import('@/interface/views/ForgotPasswordView.vue'),
  },
  {
    path: 'reinitialisation-mot-de-passe',
    alias: 'reset-password',
    name: ROUTE_NAMES.RESET_PASSWORD,
    meta: { guestOnly: true },
    component: () => import('@/interface/views/ResetPasswordView.vue'),
  },
  {
    path: 'verification-email',
    alias: 'email-verification',
    name: ROUTE_NAMES.VERIFY_EMAIL,
    meta: { guestOnly: true },
    component: () => import('@/interface/views/EmailCheckView.vue'),
  },
]
