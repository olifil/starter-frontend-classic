export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  termsAccepted: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RevokeSessionsRequest {
  userId?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: string
}
