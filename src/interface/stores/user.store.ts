import type { UpdateUserRequest, UserProfile } from '@/core/domain/types/user.types'
import { UserHttpAdapter } from '@/infrastructure/adapters/http/user.http-adapter'
import { useAuthStore } from './auth.store'
import { ROUTE_NAMES } from '@/router/route-names'
import type { UserRepository } from '@/core/domain/ports/user.repository'

export const useUserStore = defineStore('user', () => {
  const repository: UserRepository = new UserHttpAdapter()
  const { clearTokens } = useAuthStore()
  const router = useRouter()

  const me = ref<UserProfile | null>(null)

  async function getMe() {
    try {
      me.value = await repository.getMe()
    } catch {
      me.value = null
    }
  }

  async function updateMe(data: UpdateUserRequest) {
    me.value = await repository.updateMe(data)
  }

  async function deleteMe() {
    await repository.deleteMe()
    clearTokens()
    me.value = null
    router.push({ name: ROUTE_NAMES.HOMEPAGE })
  }

  return { getMe, updateMe, me, deleteMe }
})
