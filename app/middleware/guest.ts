export default defineNuxtRouteMiddleware((_to, _from) => {
  const token = useCookie('access_token')
  
  if (token.value) {
    return navigateTo('/expenses')
  }
})
