/**
 * Expense Management Composable
 * Provides reactive state management and business logic for expenses
 */

import { ref, reactive, computed, onMounted, toRefs, readonly } from 'vue'
import type { 
  Expense, 
  CreateExpenseDto, 
  ExpenseSearchParams,
  ApproveExpenseDto,
  RejectExpenseDto
} from '../types/domain'
import { ExpenseService, ApprovalService, PaymentService, CategoryService } from '../services/domain/expense'

interface UseExpenseOptions {
  initialParams?: ExpenseSearchParams
  autoLoad?: boolean
}

interface ExpenseState {
  expenses: Expense[]
  currentExpense: Expense | null
  categories: Array<{ id: string; name: string; description?: string }>
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  loading: boolean
  submitting: boolean
  error: string | null
}

export const useExpenses = (options: UseExpenseOptions = {}) => {
  const { initialParams = {}, autoLoad = true } = options

  // Services
  const apiClient = useApiClient()
  const expenseService = new ExpenseService(apiClient)
  const approvalService = new ApprovalService(apiClient)
  const paymentService = new PaymentService(apiClient)
  const categoryService = new CategoryService(apiClient)

  // Reactive state
  const state = reactive<ExpenseState>({
    expenses: [],
    currentExpense: null,
    categories: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },
    loading: false,
    submitting: false,
    error: null
  })

  // Search parameters
  const searchParams = ref<ExpenseSearchParams>({
    page: 1,
    limit: 10,
    ...initialParams
  })

  // Computed properties
  const hasExpenses = computed(() => state.expenses.length > 0)
  const isEmpty = computed(() => !state.loading && !hasExpenses.value)
  const canLoadMore = computed(() => state.pagination.page < state.pagination.totalPages)

  // Actions
  const loadExpenses = async (params?: Partial<ExpenseSearchParams>) => {
    try {
      state.loading = true
      state.error = null

      const mergedParams = { ...searchParams.value, ...params }
      const result = await expenseService.getExpenses(mergedParams)

      state.expenses = result.items
      state.pagination = {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }

      // Update search params
      searchParams.value = mergedParams
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to load expenses'
      console.error('Error loading expenses:', error)
    } finally {
      state.loading = false
    }
  }

  const loadMoreExpenses = async () => {
    if (!canLoadMore.value || state.loading) return

    try {
      state.loading = true
      const nextPageParams = {
        ...searchParams.value,
        page: state.pagination.page + 1
      }

      const result = await expenseService.getExpenses(nextPageParams)
      
      // Append new expenses to existing list
      state.expenses.push(...result.items)
      state.pagination = {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }

      searchParams.value = nextPageParams
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to load more expenses'
    } finally {
      state.loading = false
    }
  }

  const getExpenseById = async (id: string) => {
    try {
      state.loading = true
      state.error = null
      
      const expense = await expenseService.getExpenseById(id)
      state.currentExpense = expense
      
      return expense
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to load expense'
      throw error
    } finally {
      state.loading = false
    }
  }

  const createExpense = async (expenseData: CreateExpenseDto) => {
    try {
      state.submitting = true
      state.error = null

      const newExpense = await expenseService.createExpense(expenseData)
      
      // Add to beginning of list
      state.expenses.unshift(newExpense)
      state.currentExpense = newExpense

      return newExpense
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to create expense'
      throw error
    } finally {
      state.submitting = false
    }
  }

  const updateExpense = async (id: string, updates: Partial<CreateExpenseDto>) => {
    try {
      state.submitting = true
      state.error = null

      const updatedExpense = await expenseService.updateExpense(id, updates)
      
      // Update in list
      const index = state.expenses.findIndex(e => e.id === id)
      if (index !== -1) {
        state.expenses[index] = updatedExpense
      }
      
      if (state.currentExpense?.id === id) {
        state.currentExpense = updatedExpense
      }

      return updatedExpense
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to update expense'
      throw error
    } finally {
      state.submitting = false
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      state.submitting = true
      state.error = null

      await expenseService.deleteExpense(id)
      
      // Remove from list
      state.expenses = state.expenses.filter(e => e.id !== id)
      
      if (state.currentExpense?.id === id) {
        state.currentExpense = null
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to delete expense'
      throw error
    } finally {
      state.submitting = false
    }
  }

  const approveExpense = async (id: string, approvalData: ApproveExpenseDto = {}) => {
    try {
      state.submitting = true
      state.error = null

      const approvedExpense = await approvalService.approveExpense(id, approvalData)
      
      // Update in list
      const index = state.expenses.findIndex(e => e.id === id)
      if (index !== -1) {
        state.expenses[index] = approvedExpense
      }
      
      if (state.currentExpense?.id === id) {
        state.currentExpense = approvedExpense
      }

      return approvedExpense
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to approve expense'
      throw error
    } finally {
      state.submitting = false
    }
  }

  const rejectExpense = async (id: string, rejectionData: RejectExpenseDto) => {
    try {
      state.submitting = true
      state.error = null

      const rejectedExpense = await approvalService.rejectExpense(id, rejectionData)
      
      // Update in list
      const index = state.expenses.findIndex(e => e.id === id)
      if (index !== -1) {
        state.expenses[index] = rejectedExpense
      }
      
      if (state.currentExpense?.id === id) {
        state.currentExpense = rejectedExpense
      }

      return rejectedExpense
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to reject expense'
      throw error
    } finally {
      state.submitting = false
    }
  }

  const retryPayment = async (id: string) => {
    try {
      state.submitting = true
      state.error = null

      const updatedExpense = await paymentService.retryPayment(id)
      
      // Update in list
      const index = state.expenses.findIndex(e => e.id === id)
      if (index !== -1) {
        state.expenses[index] = updatedExpense
      }
      
      if (state.currentExpense?.id === id) {
        state.currentExpense = updatedExpense
      }

      return updatedExpense
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to retry payment'
      throw error
    } finally {
      state.submitting = false
    }
  }

  const loadCategories = async () => {
    try {
      const categories = await categoryService.getCategories()
      state.categories = categories
      return categories
    } catch (error) {
      console.error('Error loading categories:', error)
      return []
    }
  }

  const searchExpenses = async (filters: ExpenseSearchParams) => {
    const params = { ...filters, page: 1 } // Reset to first page for new search
    await loadExpenses(params)
  }

  const resetSearch = async () => {
    searchParams.value = { page: 1, limit: 10 }
    await loadExpenses()
  }

  const refreshExpenses = () => loadExpenses(searchParams.value)

  // Auto-load on mount
  if (autoLoad) {
    onMounted(() => {
      loadExpenses()
      loadCategories()
    })
  }

  return {
    // State
    ...toRefs(state),
    searchParams: readonly(searchParams),
    
    // Computed
    hasExpenses,
    isEmpty,
    canLoadMore,
    
    // Actions
    loadExpenses,
    loadMoreExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    retryPayment,
    loadCategories,
    searchExpenses,
    resetSearch,
    refreshExpenses
  }
}
