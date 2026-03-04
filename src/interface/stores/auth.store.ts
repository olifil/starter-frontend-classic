import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/core/domain/types/auth.types'
import { useUserStore } from './user.store'
import { ROUTE_NAMES } from '@/router/route-names'
import i18n from '@/i18n'
import { Toast } from '@/interface/composables/toast'
import { AuthHttpAdapter } from '@/infrastructure/adapters/http/auth.http-adapter'

const toast = new Toast()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (i18n.global as any).t as (key: string) => string

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const repository = new AuthHttpAdapter()
  const accessToken = ref<string | null>(localStorage.getItem('access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const isAuthenticated = computed(() => !!accessToken.value)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  function clearTokens() {
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  async function login(data: LoginRequest) {
    loading.value = true
    error.value = null
    try {
      const response = await repository.login(data)
      setTokens(response.accessToken, response.refreshToken)
      await useUserStore().getMe()
      router.push('/')
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    loading.value = true
    error.value = null
    try {
      await repository.register(data)
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(data: ForgotPasswordRequest) {
    loading.value = true
    error.value = null
    try {
      await repository.forgotPassword(data)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await repository.logout()
    } finally {
      clearTokens()
      useUserStore().me = null
      router.push({ name: ROUTE_NAMES.HOMEPAGE })
    }
  }

  async function resetPassword(data: ResetPasswordRequest) {
    loading.value = true
    try {
      await repository.resetPassword(data)
      toast.success(
        t('auth.reset-password.success.title'),
        t('auth.reset-password.success.description'),
      )
      router.push({ name: ROUTE_NAMES.LOGIN })
    } finally {
      loading.value = false
    }
  }

  async function emailVerification(token: string) {
    try {
      await repository.verifyEmail({ token })
      toast.success(
        t('emailVerification.success.title'),
        t('emailVerification.success.description'),
      )
      router.push({ name: ROUTE_NAMES.LOGIN })
    } catch {
      router.push({ name: ROUTE_NAMES.HOMEPAGE })
    }
  }

  return {
    accessToken,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    emailVerification,
    clearTokens,
  }
})
