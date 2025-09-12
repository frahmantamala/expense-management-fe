/**
 * API Configuration and Base HTTP Client
 * Centralized configuration following DRY and separation of concerns
 */

interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
  autoAuth?: boolean  // Whether to automatically inject auth tokens
}

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  data?: unknown
  params?: Record<string, string | number | boolean>
  headers?: Record<string, string>
  requiresAuth?: boolean  // Override autoAuth for specific requests
}

class ApiError extends Error {
  public readonly status: number
  public readonly errors?: string[]

  constructor(config: { message: string; status: number; errors?: string[] }) {
    super(config.message)
    this.status = config.status
    this.errors = config.errors
    this.name = 'ApiError'
  }
}

class HttpClient {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
  }

  private getAuthToken(): string | null {
    if (!import.meta.client) return null
    
    try {
      // Use Nuxt's useCookie to read the token
      const accessToken = useCookie('access_token')
      const token = accessToken.value
      return token && token !== 'null' ? String(token) : null
    } catch (error) {
      console.error('Error reading auth token:', error)
      return null
    }
  }

  private async handleAuthError(): Promise<void> {
    if (import.meta.client) {
      // Clear invalid tokens
      document.cookie = 'access_token=; Max-Age=0; path=/'
      document.cookie = 'refresh_token=; Max-Age=0; path=/'
      
      // Redirect to login
      await navigateTo('/login')
    }
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    const { method, url, data, params, headers = {} } = config
    const fullUrl = new URL(`${this.config.baseURL}${url}`)
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fullUrl.searchParams.append(key, String(value))
        }
      })
    }

    // Prepare headers
    const requestHeaders = {
      ...this.config.headers,
      ...headers,
    }

    // Handle authentication
    const shouldAuth = config.requiresAuth ?? this.config.autoAuth
    if (shouldAuth) {
      const token = this.getAuthToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      } else {
        throw new ApiError({
          message: 'No authentication token available',
          status: 401,
        })
      }
    }

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(this.config.timeout),
    }

    // Add body for non-GET requests
    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        requestInit.body = data
        // Remove Content-Type to let browser set it with boundary for FormData
        delete (requestInit.headers as Record<string, string>)['Content-Type']
      } else {
        requestInit.body = JSON.stringify(data)
        requestHeaders['Content-Type'] = 'application/json'
      }
    }

    try {
      const response = await fetch(fullUrl.toString(), requestInit)
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          await this.handleAuthError()
          throw new ApiError({
            message: 'Authentication failed',
            status: response.status,
          })
        }
        
        if (response.status === 403) {
          throw new ApiError({
            message: 'Access forbidden',
            status: response.status,
          })
        }

        const errorData = await response.json().catch(() => ({}))
        throw new ApiError({
          message: errorData.message || 'Request failed',
          status: response.status,
          errors: errorData.errors,
        })
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return {} as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Handle network errors, timeouts, etc.
      throw new ApiError({
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
      })
    }
  }

  async get<T>(url: string, params?: Record<string, string | number | boolean>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'GET', url, params, headers })
  }

  async post<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, headers })
  }

  async put<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data, headers })
  }

  async patch<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data, headers })
  }

  async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, headers })
  }

  // Convenience methods with explicit auth control
  async getAuth<T>(url: string, params?: Record<string, string | number | boolean>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'GET', url, params, headers, requiresAuth: true })
  }

  async postAuth<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, headers, requiresAuth: true })
  }

  async putAuth<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data, headers, requiresAuth: true })
  }

  async deleteAuth<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, headers, requiresAuth: true })
  }
}

export { HttpClient, ApiError }
export type { ApiConfig, RequestConfig }
