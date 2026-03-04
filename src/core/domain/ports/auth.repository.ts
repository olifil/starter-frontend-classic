import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  RevokeSessionsRequest,
  VerifyEmailRequest,
} from '../types/auth.types'

export interface AuthRepository {
  register(data: RegisterRequest): Promise<void>
  login(data: LoginRequest): Promise<LoginResponse>
  refresh(data: RefreshTokenRequest): Promise<LoginResponse>
  forgotPassword(data: ForgotPasswordRequest): Promise<void>
  resetPassword(data: ResetPasswordRequest): Promise<void>
  verifyEmail(data: VerifyEmailRequest): Promise<void>
  logout(): Promise<void>
  revokeSessions(data: RevokeSessionsRequest): Promise<void>
}
