/**
 * API Client Composables
 * Provides unified HTTP clients using the modern HttpClient architecture
 */

import { HttpClient } from '~/app/services/api/client'

/**
 * Get the main API client for general endpoints
 */
export function useApiClient(): HttpClient {
  const config = useRuntimeConfig()
  
  return new HttpClient({
    baseURL: config.public.apiBaseURL || 'http://localhost:8080/api/v1',
    timeout: 10000,
    autoAuth: true, // Automatically inject auth headers
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
}

/**
 * Get the auth API client for authentication endpoints
 */
export function useAuthApiClient(): HttpClient {
  const config = useRuntimeConfig()
  
  return new HttpClient({
    baseURL: config.public.authApiBaseURL || 'http://localhost:8080/api/v1',
    timeout: 10000,
    autoAuth: false, // Auth endpoints don't need auth headers
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
}
