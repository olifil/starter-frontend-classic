import type { AuthRepository } from '@/core/domain/ports/auth.repository'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  RevokeSessionsRequest,
  VerifyEmailRequest,
} from '@/core/domain/types/auth.types'
import { HttpAdapter } from './http-adapter'

export class AuthHttpAdapter extends HttpAdapter implements AuthRepository {
  constructor() {
    super('auth')
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/login', data)
  }

  async register(data: RegisterRequest): Promise<void> {
    await this.post('/register', data)
  }

  async refresh(data: RefreshTokenRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/refresh', data)
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await this.post('/forgot-password', data)
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await this.post('/reset-password', data)
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    await this.post('/verify-email', data)
  }

  async logout(): Promise<void> {
    await this.post('/logout')
  }

  async revokeSessions(data: RevokeSessionsRequest): Promise<void> {
    await this.post('/revoke', data)
  }

}
