import { api } from './api'
import type { AuthResponse } from '../types'

export const AuthService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password })
    return response.data
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken })
    return response.data
  },

  async logout(): Promise<void> {
    await api.delete('/auth/logout')
  },
}
