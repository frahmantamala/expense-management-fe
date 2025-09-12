<template>
  <div id="app">
    <NuxtRouteAnnouncer />
    
    <!-- Navigation Header - Only show for authenticated users -->
    <header v-if="authStore.isAuthenticated" class="bg-white shadow-sm border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">
                Expense
              </h1>
            </div>
            
            <!-- Navigation Links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink
                to="/expenses"
                class="nav-link inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                My Expenses
              </NuxtLink>
            </div>
          </div>
          
          <!-- User menu -->
          <div class="flex items-center">
            <div class="flex items-center space-x-2">
              <img 
                :src="`https://ui-avatars.com/api/?name=${authStore.currentUser?.name}&background=3b82f6&color=ffffff`" 
                :alt="authStore.currentUser?.name"
                class="w-8 h-8 rounded-full"
              >
              <span class="hidden sm:inline text-sm font-medium text-gray-700">
                {{ authStore.currentUser?.name }}
              </span>
              <button
                class="ml-2 text-sm text-gray-500 hover:text-gray-700"
                @click="authStore.logout"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="min-h-screen bg-gray-50">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          Expense Management.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/app/stores/auth'

// Auth store
const authStore = useAuthStore()

// Global app setup
useHead({
  title: 'Expense',
  meta: [
    { name: 'description', content: 'Modern expense management system' }
  ]
})

// Initialize auth check on app mount
onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<style>
/* Global styles */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Navigation active link styles */
.router-link-active {
  border-bottom: 2px solid #3b82f6 !important;
  color: #2563eb !important;
}

/* Custom navigation styles */
.nav-link {
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-link:hover {
  border-bottom-color: #d1d5db;
}

.nav-link.router-link-active {
  border-bottom-color: #3b82f6;
  color: #2563eb;
}

/* Custom utility classes */
.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  color: white;
  background-color: #3b82f6;
  transition: background-color 0.15s ease;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  color: #374151;
  background-color: white;
  transition: background-color 0.15s ease;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.card-padding {
  padding: 1.5rem;
}

/* Form styles */
.form-input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

/* Status badge styles */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-approved {
  background-color: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-paid {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Container utilities */
.container-padding {
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .container-padding {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .container-padding {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

.section-spacing {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

@media (min-width: 640px) {
  .section-spacing {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
}

/* Animation utilities */
.fade-in {
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Expense card specific styles */
.expense-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.expense-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-color: #d1d5db;
  transform: translateY(-1px);
}

/* Enhanced button styles */
.btn-action {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  text-decoration: none;
  transition: all 0.15s ease;
  cursor: pointer;
}

.btn-action:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

/* Loading states */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Responsive grid utilities */
.grid-responsive {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
