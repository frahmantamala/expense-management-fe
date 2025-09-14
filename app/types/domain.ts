export const BUSINESS_RULES = {
  AUTO_APPROVAL_THRESHOLD: 1000000,
  MAX_EXPENSE_AMOUNT: 100000000,
  MIN_DESCRIPTION_LENGTH: 5,
  MAX_DESCRIPTION_LENGTH: 500,
  SUPPORTED_CURRENCIES: ['IDR', 'USD'] as const,
  RECEIPT_MAX_SIZE: 5 * 1024 * 1024,
  SUPPORTED_RECEIPT_FORMATS: ['image/jpeg', 'image/png', 'application/pdf'] as const
} as const

export type SupportedCurrency = typeof BUSINESS_RULES.SUPPORTED_CURRENCIES[number]
export type SupportedReceiptFormat = typeof BUSINESS_RULES.SUPPORTED_RECEIPT_FORMATS[number]

export enum ExpenseStatus {
  PENDING_APPROVAL = 'pending_approval',
  AUTO_APPROVED = 'auto_approved',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed'
}

export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export interface Money {
  amount: number
  currency: SupportedCurrency
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
}

export interface CreateExpenseDto {
  amount_idr: number
  description: string
  category: string
  expense_date: string
  receipt_url?: string
  receipt_filename?: string
}

export interface CreateExpenseFormDto {
  description: string
  amount: number
  category: string
  expenseDate: Date
  receiptFile?: UploadedFileState
}

export interface UpdateExpenseDto {
  amount_idr?: number
  description?: string
  category?: string
  expense_date?: string
  receipt_url?: string
  receipt_filename?: string
}

export interface ApproveExpenseDto {
  notes?: string
}

export interface RejectExpenseDto {
  reason: string
}

export interface ExpensesApiResponse {
  expenses: ApiExpense[]
  limit: number
  offset: number
  total?: number
  total_data?: number 
}

export interface ApiExpense {
  id: number
  user_id: number
  amount_idr: number
  description: string
  category: string
  expense_status: string
  expense_date: string
  submitted_at: string
  processed_at?: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  userId: number
  amount: Money
  description: string
  category: string
  expenseStatus: ExpenseStatus
  expenseDate: Date
  submittedAt: Date
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ExpenseFilters {
  status?: ExpenseStatus[]
  paymentStatus?: PaymentStatus[]
  categoryId?: string
  submittedBy?: string
  dateFrom?: Date
  dateTo?: Date
  amountMin?: number
  amountMax?: number
}

export interface ExpenseSearchParams extends ExpenseFilters {
  page?: number
  offset?: number
  limit?: number
  sortBy?: 'createdAt' | 'amount' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface ExpenseFormState {
  description: string
  amount: number | null
  category: string
  expenseDate: Date | null
  receiptFile: File | null
}

export interface ExpenseFormErrors {
  description?: string
  amount?: string
  category?: string
  expenseDate?: string
  receiptFile?: string
  general?: string
}

export interface FileUploadResponse {
  originalname: string
  filename: string
  location: string
}

export interface UploadedFileState {
  file: File
  url: string
  filename: string
  uploading?: boolean
  error?: string
}
