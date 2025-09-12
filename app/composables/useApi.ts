/**
 * API Composable
 * Provides configured API clients using Nuxt runtime config
 */

import { createAuthApi, createUserApi } from '~/app/services/api'

export function useApi() {
  const authApi = createAuthApi()
  const userApi = createUserApi()
  
  return {
    authApi,
    userApi
  }
}
