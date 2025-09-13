/**
 * API Service with Interceptors
 * Handles HTTP requests with automatic Bearer token injection
 */

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  requiresAuth?: boolean
}

export class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string, timeout = 10000) {
    this.baseURL = baseURL
    this.timeout = timeout
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  private getAuthToken(): string | null {
    try {
      const accessToken = useCookie('access_token')
      const token = accessToken.value
      
      return token && token !== 'null' ? String(token) : null
    } catch (error) {
      console.error('Error reading token:', error)
      return null
    }
  }

  private async interceptRequest(config: RequestConfig): Promise<RequestConfig> {
    const headers = { ...this.defaultHeaders, ...config.headers }

    if (config.requiresAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      } else {
        console.error('No authentication token available for authenticated request')
        throw new Error('No authentication token available')
      }
    }

    return { ...config, headers }
  }

  private async interceptResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        if (import.meta.client) {
          // clear invalid token
          document.cookie = 'access_token=; Max-Age=0; path=/'
          document.cookie = 'refresh_token=; Max-Age=0; path=/'
          
          // redirect to login
          await navigateTo('/login')
        }
        throw new Error('Authentication failed')
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden')
      }
      
      if (response.status >= 500) {
        throw new Error('Server error')
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    
    return {} as T
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      // apply request interceptor
      const interceptedConfig = await this.interceptRequest(config)
      
      const requestOptions: RequestInit = {
        method: interceptedConfig.method || 'GET',
        headers: interceptedConfig.headers,
        signal: AbortSignal.timeout(this.timeout)
      }

      if (interceptedConfig.body) {
        requestOptions.body = typeof interceptedConfig.body === 'string' 
          ? interceptedConfig.body 
          : JSON.stringify(interceptedConfig.body)
      }

      const response = await fetch(url, requestOptions)
      // apply response interceptor
      return await this.interceptResponse<T>(response)
      
    } catch (error) {
      console.error(`API Request failed: ${config.method || 'GET'} ${url}`, error)
      throw error
    }
  }

  async get<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth })
  }

  async post<T>(endpoint: string, body?: unknown, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth })
  }

  async put<T>(endpoint: string, body?: unknown, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth })
  }

  async delete<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth })
  }
}

export function createAuthApi() {
  const config = useRuntimeConfig()
  return new ApiClient(config.public.authApiBaseURL)
}

export function createUserApi() {
  const config = useRuntimeConfig()
  return new ApiClient(config.public.apiBaseURL)
}