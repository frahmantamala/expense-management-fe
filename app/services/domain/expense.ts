/**
 * Expense Domain Service
 * Handles all expense-related business operations following DDD principles
 */

import type { 
  Expense, 
  ApiExpense,
  ExpensesApiResponse,
  CreateExpenseDto,
  CreateExpenseFormDto,
  UpdateExpenseDto,
  ExpenseSearchParams,
  ApproveExpenseDto,
  RejectExpenseDto,
  Money
} from '../../types/domain'
import { ExpenseStatus } from '../../types/domain'
import type { HttpClient } from '../api/client'

// Domain response format for expenses
export interface ExpenseListResponse {
  expenses: Expense[]
  limit: number
  offset: number
}

/**
 * Transform API expense to domain expense
 */
function transformApiExpense(apiExpense: ApiExpense): Expense {
  return {
    id: apiExpense.id.toString(),
    userId: apiExpense.user_id,
    amount: {
      amount: apiExpense.amount_idr,
      currency: 'IDR'
    } as Money,
    description: apiExpense.description,
    category: apiExpense.category,
    expenseStatus: apiExpense.expense_status as ExpenseStatus,
    expenseDate: new Date(apiExpense.expense_date),
    submittedAt: new Date(apiExpense.submitted_at),
    processedAt: apiExpense.processed_at ? new Date(apiExpense.processed_at) : undefined,
    createdAt: new Date(apiExpense.created_at),
    updatedAt: new Date(apiExpense.updated_at)
  }
}

export class ExpenseService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get paginated list of expenses with filters
   */
  async getExpenses(params: ExpenseSearchParams = {}): Promise<ExpenseListResponse> {
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

    // Get raw API response
    const apiResponse = await this.httpClient.get<ExpensesApiResponse>(
      '/expenses',
      apiParams
    )
    
    // Transform API expenses to domain expenses
    const transformedExpenses = apiResponse.expenses.map(transformApiExpense)
    
    return {
      expenses: transformedExpenses,
      limit: apiResponse.limit,
      offset: apiResponse.offset
    }
  }

  /**
   * Get single expense by ID
   */
  async getExpenseById(id: string): Promise<Expense> {
    // Get raw API response and transform it
    const apiExpense = await this.httpClient.get<ApiExpense>(`/expenses/${id}`)
    return transformApiExpense(apiExpense)
  }

  /**
   * Create new expense
   * Accepts form data and transforms it to API format
   */
  async createExpense(formData: CreateExpenseFormDto): Promise<Expense> {
    // Transform form data to API format
    const apiData: CreateExpenseDto = {
      amount_idr: formData.amount || 0,
      description: formData.description,
      category: formData.category,
      expense_date: formData.expenseDate?.toISOString() || new Date().toISOString()
    }

    // Handle file upload if present - file is already uploaded
    if (formData.receiptFile && formData.receiptFile.url) {
      apiData.receipt_url = formData.receiptFile.url
      apiData.receipt_filename = formData.receiptFile.filename
    }

    // Send JSON data to API
    const apiExpense = await this.httpClient.post<ApiExpense>('/expenses', apiData)
    return transformApiExpense(apiExpense)
  }

  /**
   * Upload receipt file to external file service
   * Uses the external API for file uploads
   */
  private async uploadReceipt(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Use fetch directly for file upload to external API
      const response = await fetch('https://api.escuelajs.co/api/v1/files/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it with boundary
      })

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`)
      }

      const result: { originalname: string; filename: string; location: string } = await response.json()
      
      return {
        url: result.location,
        filename: result.filename
      }
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error('Failed to upload receipt file')
    }
  }

  /**
   * Update existing expense (only allowed if not approved/rejected)
   */
  async updateExpense(id: string, formData: Partial<CreateExpenseFormDto>): Promise<Expense> {
    // Transform form data to API format
    const apiData: Partial<UpdateExpenseDto> = {}
    
    if (formData.amount !== undefined) apiData.amount_idr = formData.amount || 0
    if (formData.description !== undefined) apiData.description = formData.description
    if (formData.category !== undefined) apiData.category = formData.category
    if (formData.expenseDate !== undefined) {
      apiData.expense_date = formData.expenseDate?.toISOString() || new Date().toISOString()
    }

    // Handle file upload if present - file is already uploaded
    if (formData.receiptFile && formData.receiptFile.url) {
      apiData.receipt_url = formData.receiptFile.url
      apiData.receipt_filename = formData.receiptFile.filename
    }

    // Get raw API response and transform it
    const apiExpense = await this.httpClient.put<ApiExpense>(`/expenses/${id}`, apiData)
    return transformApiExpense(apiExpense)
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
  async getPendingApprovals(params: ExpenseSearchParams = {}): Promise<ExpenseListResponse> {
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
    // Get raw API response and transform it
    const apiExpense = await this.httpClient.patch<ApiExpense>(
      `/expenses/${id}/approve`,
      approvalData
    )
    return transformApiExpense(apiExpense)
  }

  /**
   * Reject expense
   */
  async rejectExpense(id: string, rejectionData: RejectExpenseDto): Promise<Expense> {
    // Get raw API response and transform it
    const apiExpense = await this.httpClient.patch<ApiExpense>(
      `/expenses/${id}/reject`,
      rejectionData
    )
    return transformApiExpense(apiExpense)
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
    // Get raw API response and transform it
    const apiExpense = await this.httpClient.post<ApiExpense>(
      `/expenses/${expenseId}/payment/retry`
    )
    return transformApiExpense(apiExpense)
  }

  /**
   * Get payment status for expense
   */
  async getPaymentStatus(expenseId: string): Promise<{ status: string; details?: string }> {
    // API returns payment status directly
    return await this.httpClient.get<{ status: string; details?: string }>(
      `/expenses/${expenseId}/payment/status`
    )
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
    // API returns categories array directly
    const response = await this.httpClient.get<{categories: Array<{ id: string; name: string; description?: string }>}>('/categories')
    return response.categories
  }
}
