/**
 * Authentication Domain Service
 * Handles user authentication operations using HttpClient
 */

import type { HttpClient } from '../api/client'

export interface User {
  id: number
  email: string
  name: string
  department: string
  is_active: boolean
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export class AuthService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.httpClient.post<LoginResponse>('/auth/login', credentials)
    return response
  }

  /**
   * Get current user profile (requires authentication)
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.httpClient.getAuth<User>('/users/me')
    return response
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await this.httpClient.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken
    })
    return response
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.httpClient.postAuth('/auth/logout')
  }
}
