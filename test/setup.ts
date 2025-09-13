import { vi } from 'vitest'

// Mock Nuxt auto-imports and composables
vi.mock('#imports', () => ({
  useCookie: vi.fn(),
  useRuntimeConfig: vi.fn(() => ({
    public: {
      apiBaseURL: 'http://localhost:8080/api/v1',
      authApiBaseURL: 'http://localhost:8080/api/v1/auth'
    }
  })),
  navigateTo: vi.fn(),
  useNuxtApp: vi.fn(),
}))

// Mock process for Nuxt environment
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {} as NodeJS.Process
}
// @ts-expect-error: Mock for testing environment
globalThis.process.client = true
// @ts-expect-error: Mock for testing environment  
globalThis.process.server = false
