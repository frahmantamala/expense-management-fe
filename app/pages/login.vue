<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <!-- Login Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              v-model="loginForm.email"
              type="email"
              autocomplete="email"
              required
              placeholder="Enter your email"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            >
            <p v-if="form.errors.email" class="mt-1 text-sm text-red-600">
              {{ form.errors.email }}
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="Enter your password"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            >
            <p v-if="form.errors.password" class="mt-1 text-sm text-red-600">
              {{ form.errors.password }}
            </p>
          </div>
        </div>

        <!-- Remember me -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="loginForm.rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            >
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="form.errors.general" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">
            {{ form.errors.general }}
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="form.isSubmitting"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ form.isSubmitting ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <!-- Demo Credentials Button -->
        <div>
          <button
            type="button"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="fillDemoCredentials"
          >
            Fill Demo Credentials
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/app/stores/auth'

// Page metadata
definePageMeta({
  title: 'Login',
  description: 'Sign in to your account',
  layout: false,
  middleware: 'guest'
})

// Reactive form data
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Form state management
const form = reactive({
  isSubmitting: false,
  errors: {
    email: '',
    password: '',
    general: ''
  }
})

// Auth store
const authStore = useAuthStore()

// Form validation
const validateForm = () => {
  // Reset errors
  form.errors.email = ''
  form.errors.password = ''
  form.errors.general = ''

  let isValid = true

  // Email validation
  if (!loginForm.email) {
    form.errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
    form.errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Password validation
  if (!loginForm.password) {
    form.errors.password = 'Password is required'
    isValid = false
  } else if (loginForm.password.length < 6) {
    form.errors.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

// Handle form submission
const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  form.isSubmitting = true

  try {
    const credentials = {
      email: loginForm.email,
      password: loginForm.password
    }
    
    const success = await authStore.login(credentials)

    if (success) {
      // Redirect to expenses page
      await navigateTo('/expenses')
    } else {
      form.errors.general = 'Invalid email or password'
    }
  } catch (error) {
    console.error('Login error:', error)
    form.errors.general = 'An error occurred during login. Please try again.'
  } finally {
    form.isSubmitting = false
  }
}

// Fill demo credentials for testing
const fillDemoCredentials = () => {
  loginForm.email = 'fadhil@mail.com'
  loginForm.password = 'password'
}

// Redirect if already logged in
// onMounted(() => {
//   if (authStore.isAuthenticated) {
//     router.push('/expenses')
//   }
// })
</script>

<style scoped>
/* Additional custom styles for the login page */
.group:hover .group-hover\:text-blue-400 {
  color: #60a5fa;
}
</style>
