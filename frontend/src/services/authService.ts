import api from './api'
import { User } from '../types'

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

export const authService = {
  async getGoogleAuthUrl(redirectUri: string): Promise<string> {
    const response = await api.post('/auth/google/login', { redirectUri })
    return response.data.authUrl
  },

  async handleGoogleCallback(code: string, state?: string): Promise<AuthResponse> {
    const response = await api.get('/auth/google/callback', {
      params: { code, state },
    })
    return response.data
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken })
  },
}

