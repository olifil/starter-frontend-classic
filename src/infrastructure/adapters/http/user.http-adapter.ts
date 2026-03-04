import type { UserRepository } from '@/core/domain/ports/user.repository'
import type { PagingRequest } from '@/core/domain/types/paging.type'
import type {
  PaginatedResponse,
  UpdateUserRequest,
  UserProfile,
} from '@/core/domain/types/user.types'
import { HttpAdapter } from '@/infrastructure/adapters/http/http-adapter'

export class UserHttpAdapter extends HttpAdapter implements UserRepository {
  constructor() {
    super('users')
  }

  async getMe(): Promise<UserProfile> {
    return this.get<UserProfile>('/me')
  }

  async updateMe(data: UpdateUserRequest): Promise<UserProfile> {
    return this.patch<UserProfile>('/me', data)
  }

  async deleteMe(): Promise<void> {
    await this.delete('/me')
  }

  async getUsers(
    params?: PagingRequest,
  ): Promise<PaginatedResponse<UserProfile>> {
    return this.get<PaginatedResponse<UserProfile>>(
      '',
      params as Record<string, unknown>,
    )
  }

  async searchUsers(q: string, limit?: number): Promise<UserProfile[]> {
    return this.get<UserProfile[]>('/search', { q, limit })
  }

  async getUser(id: string): Promise<UserProfile> {
    return this.get<UserProfile>(`/${id}`)
  }

  async deleteUser(id: string): Promise<void> {
    await this.delete(`/${id}`)
  }
}
