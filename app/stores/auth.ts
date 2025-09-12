/**
 * Authentication Store
 * Manages user authentication state and operations using HttpClient
 */
import { defineStore } from 'pinia'
import { useApiClient, useAuthApiClient } from '~/app/composables/useApiClient'
import { AuthService } from '~/app/services/domain/auth'
import type { User, LoginCredentials } from '~/app/services/domain/auth'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false
  }),

  getters: {
    currentUser: (state) => state.user,
    userPermissions: (state) => state.user?.permissions || [],
    canViewExpenses: (state) => state.user?.permissions.includes('view_expenses') || false,
    canCreateExpenses: (state) => state.user?.permissions.includes('create_expenses') || false,
    canApproveExpenses: (state) => state.user?.permissions.includes('approve_expenses') || false,
    isActive: (state) => state.user?.is_active || false
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<boolean> {
      try {
        const authApiClient = useAuthApiClient()
        const authService = new AuthService(authApiClient)
        
        // Call login API
        const response = await authService.login(credentials)

        // Store tokens in cookies
        const accessToken = useCookie('access_token', {
          maxAge: 60 * 60 * 24, // 24 hours
          httpOnly: false,
          secure: false,
          sameSite: 'lax'
        })
        
        const refreshToken = useCookie('refresh_token', {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          httpOnly: false,
          secure: false,
          sameSite: 'lax'
        })

        accessToken.value = response.access_token
        refreshToken.value = response.refresh_token

        // Wait a moment for cookies to be set
        await nextTick()
        
        // Fetch user profile
        await this.fetchUser()
        
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    async fetchUser(): Promise<boolean> {
      try {
        const apiClient = useApiClient()
        const authService = new AuthService(apiClient)
        
        const user = await authService.getCurrentUser()

        this.user = user
        this.isAuthenticated = true
        
        return true
      } catch (error) {
        console.error('Fetch user failed:', error)
        await this.logout()
        return false
      }
    },

    async refreshToken(): Promise<boolean> {
      try {
        const authApiClient = useAuthApiClient()
        const authService = new AuthService(authApiClient)
        const refreshTokenCookie = useCookie('refresh_token')
        
        if (!refreshTokenCookie.value) {
          return false
        }

        const response = await authService.refreshToken(String(refreshTokenCookie.value))

        // Update tokens
        const accessToken = useCookie('access_token')
        accessToken.value = response.access_token
        refreshTokenCookie.value = response.refresh_token

        return true
      } catch (error) {
        console.error('Token refresh failed:', error)
        await this.logout()
        return false
      }
    },

    async logout() {
      try {
        // Try to call logout API if we have a token
        const accessToken = useCookie('access_token')
        if (accessToken.value) {
          const apiClient = useApiClient()
          const authService = new AuthService(apiClient)
          await authService.logout()
        }
      } catch (error) {
        console.warn('Logout API call failed:', error)
        // Continue with local logout even if API call fails
      }

      this.user = null
      this.isAuthenticated = false

      // Clear cookies
      const accessToken = useCookie('access_token')
      const refreshToken = useCookie('refresh_token')
      
      accessToken.value = null
      refreshToken.value = null

      // Redirect to login
      await navigateTo('/login')
    },

    async checkAuth(): Promise<boolean> {
      const accessToken = useCookie('access_token')
      
      if (!accessToken.value) {
        return false
      }

      // Try to fetch user data
      return await this.fetchUser()
    }
  }
})
