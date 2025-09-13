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
            <option v-for="category in categoryOptions" :key="category.value" :value="category.value">
              {{ category.label }}
            </option>
          </select>
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
          Showing {{ expenses.length }} of {{ pagination.total || expenses.length }} expenses
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
            <ExpenseStatusBadge :status="expense.expenseStatus" />
          </div>
          <p class="text-2xl font-bold text-gray-900 mb-2">
            {{ formatMoney(expense.amount) }}
          </p>
          <p class="text-sm text-gray-600 mb-4">{{ expense.category }}</p>
          
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
              v-if="canApproveExpense(expense)"
              type="button"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              @click="confirmApprove(expense.id)"
            >
              Approve
            </button>
            <button
              v-if="canRejectExpense(expense)"
              type="button"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              @click="confirmReject(expense.id)"
            >
              Reject
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
      :show-approve="showApproveModal"
      :show-reject="showRejectModal"
      :selected-expense="selectedExpense"
      :processing="submitting"
      :user-permissions="{
        canApprove: authStore.canApproveExpenses,
        canReject: authStore.canApproveExpenses
      }"
      @confirm-approve="approveExpense"
      @confirm-reject="rejectExpense"
      @cancel="closeModals"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { debounce } from 'lodash-es'
import type { Expense, ExpenseSearchParams } from '~/app/types/domain'
import { ExpenseStatus, BUSINESS_RULES } from '~/app/types/domain'
import { useExpenses } from '~/app/composables/useExpenses'
import { useCurrency } from '~/app/composables/useCurrency'
import { useAuthStore } from '~/app/stores/auth'
import { formatDate } from '~/app/utils/date'

definePageMeta({
  title: 'My Expenses',
  description: 'Manage and track your expense submissions',
  middleware: 'auth'
})

const { formatMoney, format: formatCurrency } = useCurrency()
const authStore = useAuthStore()

const autoApprovalThreshold = BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD

const formatIDR = (amount: number): string => {
  return formatCurrency(amount, 'IDR')
}

const isManager = computed(() => {
  return authStore.canApproveExpenses
})

const pendingApprovalExpenses = computed(() => {
  return expenses.value.filter(expense => 
    expense.expenseStatus === ExpenseStatus.PENDING_APPROVAL &&
    expense.amount.amount >= BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD
  )
})

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
  approveExpense: approveExpenseAction,
  rejectExpense: rejectExpenseAction,
  refreshExpenses,
  searchExpenses
} = useExpenses({ autoLoad: true })

const searchQuery = ref('')
const selectedStatus = ref<string | null>(null)
const selectedCategory = ref<string | null>(null)
const dateFrom = ref('')
const dateTo = ref('')
const amountMin = ref<number | null>(null)
const amountMax = ref<number | null>(null)

const sortBy = ref('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedExpense = ref<Expense | null>(null)

const canApproveExpense = (expense: Expense) => {
  return expense.expenseStatus === ExpenseStatus.PENDING_APPROVAL && 
         authStore.canApproveExpenses &&
         expense.amount.amount >= BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD
}

const canRejectExpense = (expense: Expense) => {
  return expense.expenseStatus === ExpenseStatus.PENDING_APPROVAL && 
         authStore.canApproveExpenses &&
         expense.amount.amount >= BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD
}

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

const statusOptions = computed(() => [
  { label: 'All Statuses', value: null },
  { label: 'Pending Approval', value: ExpenseStatus.PENDING_APPROVAL },
  { label: 'Auto Approved', value: ExpenseStatus.AUTO_APPROVED },
  { label: 'Approved', value: ExpenseStatus.APPROVED },
  { label: 'Rejected', value: ExpenseStatus.REJECTED }
])

const categoryOptions = computed(() => [
  { label: 'All Categories', value: null },
  ...categories.value.map(cat => ({ label: cat.name, value: cat.name }))
])

const sortOptions = computed(() => [
  { label: 'Date Created', value: 'createdAt' },
  { label: 'Amount', value: 'amount' },
  { label: 'Last Updated', value: 'updatedAt' }
])

const buildSearchParams = (): ExpenseSearchParams => {
  const params: ExpenseSearchParams = {
    offset: 0,
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

const debouncedSearch = debounce(applyFilters, 300)

const viewExpense = (expenseId: string) => {
  navigateTo(`/expenses/${expenseId}`)
}

const confirmApprove = (expenseId: string) => {
  selectedExpense.value = expenses.value.find(e => e.id === expenseId) || null
  showApproveModal.value = true
}

const confirmReject = (expenseId: string) => {
  selectedExpense.value = expenses.value.find(e => e.id === expenseId) || null
  showRejectModal.value = true
}

const approveExpense = async (approvalData: { notes?: string }) => {
  if (!selectedExpense.value) return
  
  try {
    await approveExpenseAction(selectedExpense.value.id, {
      notes: approvalData.notes
    })
    refreshExpenses()
    closeModals();
  } catch (error) {
    console.error('Error approving expense:', error)
  }
}

const rejectExpense = async (rejectionData: { reason: string }) => {
  if (!selectedExpense.value) return
  
  try {
    await rejectExpenseAction(selectedExpense.value.id, {
      reason: rejectionData.reason
    })
    refreshExpenses()
    closeModals()
  } catch (error) {
    console.error('Error rejecting expense:', error)
  }
}

const closeModals = () => {
  showApproveModal.value = false
  showRejectModal.value = false
  selectedExpense.value = null
}

// Navigation
const navigateTo = (path: string) => {
  window.location.href = path
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
