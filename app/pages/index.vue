<!--
  Index Page - Home/Landing Page
  Redirects to expenses page or shows dashboard
-->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="max-w-md w-full text-center">
      <!-- Logo -->
      <div class="mb-8">
        <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-3xl">💰</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Expense</h1>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-4">
        <NuxtLink
          to="/expenses"
          class="btn btn-primary w-full text-lg py-3"
        >
          📄 View My Expenses
        </NuxtLink>
        
        <NuxtLink
          to="/expenses/create"
          class="btn btn-secondary w-full text-lg py-3"
        >
          ➕ Create New Expense
        </NuxtLink>
      </div>

      <!-- Features -->
      <div class="mt-12 grid grid-cols-1 gap-4 text-sm text-gray-600">
        <div class="flex items-center justify-center space-x-2">
          <span class="text-blue-500">⚡</span>
          <span>Auto-approval for expenses under 1M IDR</span>
        </div>
        <div class="flex items-center justify-center space-x-2">
          <span class="text-green-500">🛡️</span>
          <span>Secure payment processing</span>
        </div>
        <div class="flex items-center justify-center space-x-2">
          <span class="text-purple-500">📊</span>
          <span>Real-time status tracking</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  title: 'Home',
  description: 'Expense',
  middleware: 'auth'
})

</script>
