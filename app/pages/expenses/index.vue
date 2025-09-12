<template>
  <div>
    <!-- Main Content Container -->
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">My Expenses</h1>
        <p class="text-gray-600 mt-2">Manage and track your expense submissions</p>
      </div>
      <NuxtLink
        to="/expenses/create"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <span class="mr-2">➕</span>
        New Expense
      </NuxtLink>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search expenses..."
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            @input="debouncedSearch"
          >
        </div>

        <!-- Status Filter -->
        <div>
          <select
            v-model="selectedStatus"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            @change="applyFilters"
          >
            <option value="">All Statuses</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>

        <!-- Category Filter -->
        <div>
          <select
            v-model="selectedCategory"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            :disabled="categoriesLoading"
            @change="applyFilters"
          >
            <option value="">All Categories</option>
            <option v-for="category in categoryOptions" :key="category.value" :value="category.value">
              {{ category.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Advanced Filters Toggle -->
      <div class="mt-4">
        <button
          type="button"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          <span class="w-4 h-4 mr-2">
            {{ showAdvancedFilters ? '▲' : '▼' }}
          </span>
          {{ showAdvancedFilters ? 'Hide' : 'Show' }} Advanced Filters
        </button>
      </div>

      <!-- Advanced Filters -->
      <div v-if="showAdvancedFilters" class="mt-4 pt-4 border-t border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Date Range -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="dateFrom"
                type="date"
                placeholder="From"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @change="applyFilters"
              >
              <input
                v-model="dateTo"
                type="date"
                placeholder="To"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @change="applyFilters"
              >
            </div>
          </div>

          <!-- Amount Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model.number="amountMin"
                type="number"
                placeholder="Min"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @input="debouncedFilter"
              >
              <input
                v-model.number="amountMax"
                type="number"
                placeholder="Max"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                @input="debouncedFilter"
              >
            </div>
          </div>
        </div>

        <!-- Clear Filters -->
        <div class="mt-4">
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="clearFilters"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !expenses.length" class="flex items-center justify-center py-12">
      <svg class="animate-spin w-8 h-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span class="text-gray-600">Loading expenses...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="text-center py-12">
      <span class="w-16 h-16 text-gray-300 mx-auto mb-4 block text-6xl">📄</span>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
      <p class="text-gray-600 mb-6">
        {{ hasActiveFilters ? 'Try adjusting your filters or' : 'Get started by' }} creating your first expense.
      </p>
      <NuxtLink
        to="/expenses/create"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <span class="w-5 h-5 mr-2">➕</span>
        Create New Expense
      </NuxtLink>
    </div>

    <!-- Expense List -->
    <div v-else class="space-y-4">
      <!-- Results Summary -->
      <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>
          Showing {{ expenses.length }} of {{ pagination.total }} expenses
        </span>
        <div class="flex items-center space-x-4">
          <!-- Sort Options -->
          <select
            v-model="sortBy"
            class="block px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            @change="applySort"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <button
            type="button"
            class="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="toggleSortOrder"
          >
            <span class="w-4 h-4">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Expense Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="expense in expenses"
          :key="expense.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <!-- Expense card content would go here -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">{{ expense.description }}</h3>
            <ExpenseStatusBadge :status="expense.status" />
          </div>
          <p class="text-2xl font-bold text-gray-900 mb-2">${{ expense.amount }}</p>
          <p class="text-sm text-gray-600 mb-4">{{ expense.category?.name }}</p>
          
          <!-- Action buttons -->
          <div class="flex space-x-2">
            <button
              type="button"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="viewExpense(expense.id)"
            >
              View
            </button>
            <button
              v-if="expense.canEdit"
              type="button"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="editExpense(expense.id)"
            >
              Edit
            </button>
            <button
              v-if="expense.canDelete"
              type="button"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              @click="confirmDelete(expense.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="canLoadMore" class="text-center py-6">
        <button
          type="button"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
          @click="loadMoreExpenses"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Load More</span>
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="text-center py-8">
      <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading expenses</h3>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <button
        type="button"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        @click="refreshExpenses"
      >
        Try Again
      </button>
    </div>
    </div>

    <!-- Action Modals -->
    <ExpenseActionModals
      :show-delete="showDeleteModal"
      :show-approve="showApproveModal"
      :show-reject="showRejectModal"
      :show-retry-payment="showRetryPaymentModal"
      :selected-expense="selectedExpense"
      :processing="submitting"
      @confirm-delete="deleteExpense"
      @confirm-approve="approveExpense"
      @confirm-reject="rejectExpense"
      @confirm-retry-payment="retryPayment"
      @cancel="closeModals"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { debounce } from 'lodash-es'
import type { Expense, ExpenseSearchParams } from '../../types/domain'
import { ExpenseStatus } from '../../types/domain'
import { useExpenses } from '../../composables/useExpenses'

// Page metadata
definePageMeta({
  title: 'My Expenses',
  description: 'Manage and track your expense submissions',
  middleware: 'auth'
})

// Mock user data - in real app, this would come from auth store
const _userRole = ref<'employee' | 'manager' | 'admin'>('employee')
const _currentUserId = ref('current-user-id')

// Expense management
const {
  expenses,
  categories,
  pagination,
  loading,
  submitting,
  error,
  isEmpty,
  canLoadMore,
  loadMoreExpenses,
  deleteExpense: deleteExpenseAction,
  approveExpense: approveExpenseAction,
  rejectExpense: rejectExpenseAction,
  retryPayment: retryPaymentAction,
  refreshExpenses,
  searchExpenses
} = useExpenses({ autoLoad: true })

// Search and filter state
const searchQuery = ref('')
const selectedStatus = ref<string | null>(null)
const selectedCategory = ref<string | null>(null)
const dateFrom = ref('')
const dateTo = ref('')
const amountMin = ref<number | null>(null)
const amountMax = ref<number | null>(null)
const showAdvancedFilters = ref(false)

// Sorting
const sortBy = ref('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Modal state
const showDeleteModal = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showRetryPaymentModal = ref(false)
const selectedExpense = ref<Expense | null>(null)

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    selectedStatus.value ||
    selectedCategory.value ||
    dateFrom.value ||
    dateTo.value ||
    amountMin.value ||
    amountMax.value
  )
})

const categoriesLoading = computed(() => loading.value && !categories.value.length)

// Filter options
const statusOptions = computed(() => [
  { label: 'All Statuses', value: null },
  { label: 'Pending Approval', value: ExpenseStatus.PENDING_APPROVAL },
  { label: 'Auto Approved', value: ExpenseStatus.AUTO_APPROVED },
  { label: 'Approved', value: ExpenseStatus.APPROVED },
  { label: 'Rejected', value: ExpenseStatus.REJECTED }
])

const categoryOptions = computed(() => [
  { label: 'All Categories', value: null },
  ...categories.value.map(cat => ({ label: cat.name, value: cat.id }))
])

const sortOptions = computed(() => [
  { label: 'Date Created', value: 'createdAt' },
  { label: 'Amount', value: 'amount' },
  { label: 'Last Updated', value: 'updatedAt' }
])

// Search and filter methods
const buildSearchParams = (): ExpenseSearchParams => {
  const params: ExpenseSearchParams = {
    page: 1,
    limit: 20,
    sortBy: sortBy.value as 'createdAt' | 'amount' | 'updatedAt',
    sortOrder: sortOrder.value
  }

  if (searchQuery.value.trim()) {
    params.search = searchQuery.value.trim()
  }

  if (selectedStatus.value) {
    params.status = [selectedStatus.value as ExpenseStatus]
  }

  if (selectedCategory.value) {
    params.categoryId = selectedCategory.value
  }

  if (dateFrom.value) {
    params.dateFrom = new Date(dateFrom.value)
  }

  if (dateTo.value) {
    params.dateTo = new Date(dateTo.value)
  }

  if (amountMin.value) {
    params.amountMin = amountMin.value
  }

  if (amountMax.value) {
    params.amountMax = amountMax.value
  }

  return params
}

const applyFilters = () => {
  const params = buildSearchParams()
  searchExpenses(params)
}

const applySort = () => {
  applyFilters()
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  applyFilters()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = null
  selectedCategory.value = null
  dateFrom.value = ''
  dateTo.value = ''
  amountMin.value = null
  amountMax.value = null
  applyFilters()
}

// Debounced functions
const debouncedSearch = debounce(applyFilters, 300)
const debouncedFilter = debounce(applyFilters, 500)

// Expense actions
const viewExpense = (expenseId: string) => {
  navigateTo(`/expenses/${expenseId}`)
}

const editExpense = (expenseId: string) => {
  navigateTo(`/expenses/${expenseId}/edit`)
}

const confirmDelete = (expenseId: string) => {
  selectedExpense.value = expenses.value.find(e => e.id === expenseId) || null
  showDeleteModal.value = true
}

const _confirmApprove = (expenseId: string) => {
  selectedExpense.value = expenses.value.find(e => e.id === expenseId) || null
  showApproveModal.value = true
}

const _confirmReject = (expenseId: string) => {
  selectedExpense.value = expenses.value.find(e => e.id === expenseId) || null
  showRejectModal.value = true
}

const _confirmRetryPayment = (expenseId: string) => {
  selectedExpense.value = expenses.value.find(e => e.id === expenseId) || null
  showRetryPaymentModal.value = true
}

const deleteExpense = async () => {
  if (!selectedExpense.value) return
  
  try {
    await deleteExpenseAction(selectedExpense.value.id)
    closeModals()
  } catch (error) {
    console.error('Error deleting expense:', error)
  }
}

const approveExpense = async (approvalData: { comment?: string }) => {
  if (!selectedExpense.value) return
  
  try {
    await approveExpenseAction(selectedExpense.value.id, {
      approvalComment: approvalData.comment
    })
    closeModals()
  } catch (error) {
    console.error('Error approving expense:', error)
  }
}

const rejectExpense = async (rejectionData: { reason: string }) => {
  if (!selectedExpense.value) return
  
  try {
    await rejectExpenseAction(selectedExpense.value.id, {
      rejectionReason: rejectionData.reason
    })
    closeModals()
  } catch (error) {
    console.error('Error rejecting expense:', error)
  }
}

const retryPayment = async () => {
  if (!selectedExpense.value) return
  
  try {
    await retryPaymentAction(selectedExpense.value.id)
    closeModals()
  } catch (error) {
    console.error('Error retrying payment:', error)
  }
}

const closeModals = () => {
  showDeleteModal.value = false
  showApproveModal.value = false
  showRejectModal.value = false
  showRetryPaymentModal.value = false
  selectedExpense.value = null
}

// Navigation
const navigateTo = (path: string) => {
  // This would be replaced with actual Nuxt navigation
  console.log('Navigate to:', path)
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
