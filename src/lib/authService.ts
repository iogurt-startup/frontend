import { api } from './api'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../types'

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<{ user: AuthResponse['user'] }> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken })
    return response.data
  },

  async logout(): Promise<void> {
    await api.delete('/auth/logout')
  },

  async googleLogin(accessToken: string): Promise<GoogleAuthResponse> {
    const response = await api.post<GoogleAuthResponse>('/auth/google', { accessToken })
    return response.data
  },
}
