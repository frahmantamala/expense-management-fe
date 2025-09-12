export default defineNuxtPlugin(async () => {
  // Import the auth store composable
  const { useAuthStore } = await import('~/app/stores/auth')
  const authStore = useAuthStore()
  
  // Check if user is authenticated on app initialization
  // This runs on client-side only to restore auth state from cookies
  await authStore.checkAuth()
})
