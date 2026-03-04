import type { PagingRequest } from '../types/paging.type'
import type {
  PaginatedResponse,
  UpdateUserRequest,
  UserProfile,
} from '../types/user.types'

export interface UserRepository {
  getMe(): Promise<UserProfile>
  updateMe(data: UpdateUserRequest): Promise<UserProfile>
  deleteMe(): Promise<void>

  getUsers(params?: PagingRequest): Promise<PaginatedResponse<UserProfile>>
  searchUsers(q: string, limit?: number): Promise<UserProfile[]>
  getUser(id: string): Promise<UserProfile>
  deleteUser(id: string): Promise<void>
}
