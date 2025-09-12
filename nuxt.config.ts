import path from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@pinia/nuxt'],
  css: [
    '@/assets/css/output.css'
  ],
  alias: {
    '~': path.resolve(__dirname, './'),
    '@': path.resolve(__dirname, './'),
  },
  runtimeConfig: {
    public: {
      apiBaseURL: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
      authApiBaseURL: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'
    }
  }
})