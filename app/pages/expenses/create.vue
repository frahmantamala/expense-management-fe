<!--
  Create Expense Page
  Page for creating new expenses
-->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center space-x-4 mb-4">
        <NuxtLink
          to="/expenses"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span class="w-4 h-4 mr-2">←</span>
          Back to Expenses
        </NuxtLink>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-900">Create New Expense</h1>
      <p class="text-gray-600 mt-2">
        Submit a new expense for approval and reimbursement
      </p>
    </div>

    <!-- Form Card -->
    <div class="max-w-2xl">
      <div class="bg-white shadow rounded-lg">
        <!-- Card Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <span class="w-6 h-6 text-blue-500">➕</span>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Expense Details</h2>
              <p class="text-sm text-gray-500">
                Fill in the information below to submit your expense
              </p>
            </div>
          </div>
        </div>

        <!-- Card Body -->
        <div class="px-6 py-6">
          <!-- Loading State -->
          <div v-if="loading && !categories.length" class="flex items-center justify-center py-8">
            <svg class="animate-spin w-6 h-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span class="text-gray-600">Loading form...</span>
          </div>

          <!-- Form -->
          <ExpenseForm
            v-else
            mode="create"
            :categories="categories"
            :categories-loading="loading"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="showSuccessModal = false" />
      
      <!-- Modal Content -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="p-6 text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <span class="w-8 h-8 text-green-600 text-2xl">✓</span>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Expense Submitted Successfully!
            </h3>
            
            <div v-if="createdExpense" class="text-sm text-gray-600 mb-6">
              <p class="mb-2">
                <strong>{{ createdExpense.title }}</strong> has been submitted.
              </p>
              
              <div class="bg-gray-50 rounded-lg p-3 mb-4">
                <div class="flex items-center justify-between text-xs">
                  <span>Status:</span>
                  <ExpenseStatusBadge :status="createdExpense.expenseStatus" />
                </div>
                <div v-if="createdExpense.paymentStatus" class="flex items-center justify-between text-xs mt-2">
                  <span>Payment:</span>
                  <PaymentStatusBadge :status="createdExpense.paymentStatus" />
                </div>
              </div>
              
              <p v-if="isAutoApproved" class="text-green-600 text-sm">
                <span class="w-4 h-4 inline mr-1">⚡</span>
                Your expense was automatically approved and payment is being processed.
              </p>
              <p v-else class="text-orange-600 text-sm">
                <span class="w-4 h-4 inline mr-1">🕒</span>
                Your expense requires manager approval before payment can be processed.
              </p>
            </div>
            
            <div class="flex space-x-3 justify-center">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                @click="createAnother"
              >
                Create Another
              </button>
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                @click="viewExpenses"
              >
                View All Expenses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mt-6 max-w-2xl">
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <span class="w-5 h-5 text-red-400">⚠️</span>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Error submitting expense
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
            <div class="mt-4">
              <button
                type="button"
                class="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                @click="clearError"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CreateExpenseDto, Expense } from '../../types/domain'
import { ExpenseStatus } from '../../types/domain'
import { useExpenses } from '../../composables/useExpenses'

// Page metadata
definePageMeta({
  title: 'Create Expense',
  description: 'Submit a new expense for approval',
  middleware: 'auth'
})

// Expense management
const {
  categories,
  loading,
  error,
  createExpense
} = useExpenses({ autoLoad: false })

// Component state
const showSuccessModal = ref(false)
const createdExpense = ref<Expense | null>(null)

// Computed properties
const isAutoApproved = computed(() => {
  return createdExpense.value?.expenseStatus === ExpenseStatus.AUTO_APPROVED
})

// Methods
const handleSubmit = async (expenseData: CreateExpenseDto) => {
  try {
    const newExpense = await createExpense(expenseData)
    createdExpense.value = newExpense
    showSuccessModal.value = true
  } catch (error) {
    console.error('Error creating expense:', error)
    // Error is handled by the composable and shown in the UI
  }
}

const handleCancel = () => {
  navigateTo('/expenses')
}

const createAnother = () => {
  showSuccessModal.value = false
  createdExpense.value = null
  // Reset form - this would typically be handled by the form component
  window.location.reload()
}

const viewExpenses = () => {
  navigateTo('/expenses')
}

const clearError = () => {
  // Clear error - this would typically be a method from the composable
  console.log('Clear error')
}

// Navigation helper
const navigateTo = (path: string) => {
  // This would be replaced with actual Nuxt navigation
  console.log('Navigate to:', path)
}

// Load categories on mount
onMounted(async () => {
  const { loadCategories } = useExpenses({ autoLoad: false })
  await loadCategories()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
