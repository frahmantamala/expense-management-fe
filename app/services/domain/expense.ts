/**
 * Expense Domain Service
 * Handles all expense-related business operations following DDD principles
 */

import type { 
  Expense, 
  CreateExpenseDto, 
  UpdateExpenseDto,
  ApiResponse, 
  PaginatedResponse,
  ExpenseSearchParams,
  ApproveExpenseDto,
  RejectExpenseDto
} from '../../types/domain'
import { ExpenseStatus } from '../../types/domain'
import type { HttpClient } from '../api/client'

export class ExpenseService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get paginated list of expenses with filters
   */
  async getExpenses(params: ExpenseSearchParams = {}): Promise<PaginatedResponse<Expense>> {
    // Map frontend params to backend API params
    const apiParams: Record<string, string | number | boolean> = {}
    
    // Map pagination params
    if (params.page) apiParams.page = params.page
    if (params.limit) apiParams.per_page = params.limit
    
    // Map other filter params
    if (params.search) apiParams.search = params.search
    if (params.status) apiParams.status = params.status.join(',')
    if (params.categoryId) apiParams.category_id = params.categoryId
    if (params.dateFrom) {
      const dateFromStr = params.dateFrom.toISOString().split('T')[0]
      if (dateFromStr) apiParams.date_from = dateFromStr
    }
    if (params.dateTo) {
      const dateToStr = params.dateTo.toISOString().split('T')[0]
      if (dateToStr) apiParams.date_to = dateToStr
    }
    if (params.amountMin) apiParams.amount_min = params.amountMin
    if (params.amountMax) apiParams.amount_max = params.amountMax
    if (params.sortBy) apiParams.sort_by = params.sortBy
    if (params.sortOrder) apiParams.sort_order = params.sortOrder

    const response = await this.httpClient.get<ApiResponse<PaginatedResponse<Expense>>>(
      '/expenses',
      apiParams
    )
    return response.data
  }

  /**
   * Get single expense by ID
   */
  async getExpenseById(id: string): Promise<Expense> {
    const response = await this.httpClient.get<ApiResponse<Expense>>(`/expenses/${id}`)
    return response.data
  }

  /**
   * Create new expense
   * Automatically handles approval based on amount threshold
   */
  async createExpense(expenseData: CreateExpenseDto): Promise<Expense> {
    const formData = new FormData()
    
    // Add expense data to form
    formData.append('title', expenseData.title)
    formData.append('description', expenseData.description)
    formData.append('amount', expenseData.amount.toString())
    formData.append('currency', expenseData.currency)
    formData.append('categoryId', expenseData.categoryId)
    
    // Add receipt file if provided
    if (expenseData.receiptFile) {
      formData.append('receipt', expenseData.receiptFile)
    }

    const response = await this.httpClient.post<ApiResponse<Expense>>('/expenses', formData)
    return response.data
  }

  /**
   * Update existing expense (only allowed if not approved/rejected)
   */
  async updateExpense(id: string, updates: UpdateExpenseDto): Promise<Expense> {
    const response = await this.httpClient.put<ApiResponse<Expense>>(`/expenses/${id}`, updates)
    return response.data
  }

  /**
   * Delete expense (only allowed if not approved/paid)
   */
  async deleteExpense(id: string): Promise<void> {
    await this.httpClient.delete(`/expenses/${id}`)
  }

  /**
   * Get expenses for approval (manager view)
   */
  async getPendingApprovals(params: ExpenseSearchParams = {}): Promise<PaginatedResponse<Expense>> {
    const approvalParams = {
      ...params,
      status: [ExpenseStatus.PENDING_APPROVAL]
    }
    return this.getExpenses(approvalParams)
  }
}

/**
 * Approval Domain Service
 * Handles expense approval workflow
 */
export class ApprovalService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Approve expense
   * Triggers payment processing for approved amounts
   */
  async approveExpense(id: string, approvalData: ApproveExpenseDto = {}): Promise<Expense> {
    const response = await this.httpClient.put<ApiResponse<Expense>>(
      `/expenses/${id}/approve`,
      approvalData
    )
    return response.data
  }

  /**
   * Reject expense
   */
  async rejectExpense(id: string, rejectionData: RejectExpenseDto): Promise<Expense> {
    const response = await this.httpClient.put<ApiResponse<Expense>>(
      `/expenses/${id}/reject`,
      rejectionData
    )
    return response.data
  }
}

/**
 * Payment Domain Service
 * Handles payment-related operations
 */
export class PaymentService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Retry failed payment
   */
  async retryPayment(expenseId: string): Promise<Expense> {
    const response = await this.httpClient.post<ApiResponse<Expense>>(
      `/expenses/${expenseId}/payment/retry`
    )
    return response.data
  }

  /**
   * Get payment status for expense
   */
  async getPaymentStatus(expenseId: string): Promise<{ status: string; details?: string }> {
    const response = await this.httpClient.get<ApiResponse<{ status: string; details?: string }>>(
      `/expenses/${expenseId}/payment/status`
    )
    return response.data
  }
}

/**
 * Category Service
 * Manages expense categories
 */
export class CategoryService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get all available expense categories
   */
  async getCategories(): Promise<Array<{ id: string; name: string; description?: string }>> {
    const response = await this.httpClient.get<ApiResponse<Array<{ id: string; name: string; description?: string }>>>('/categories')
    return response.data
  }
}
