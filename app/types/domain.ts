/**
 * Domain Types for Expense Management System
 * Following Domain-Driven Design principles
 */

// Constants for business rules
export const BUSINESS_RULES = {
  AUTO_APPROVAL_THRESHOLD: 1000000, // 1M IDR
  MAX_EXPENSE_AMOUNT: 100000000, // 100M IDR
  MIN_DESCRIPTION_LENGTH: 5,
  MAX_DESCRIPTION_LENGTH: 500,
  SUPPORTED_CURRENCIES: ['IDR', 'USD'] as const,
  RECEIPT_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_RECEIPT_FORMATS: ['image/jpeg', 'image/png', 'application/pdf'] as const
} as const

export type SupportedCurrency = typeof BUSINESS_RULES.SUPPORTED_CURRENCIES[number]
export type SupportedReceiptFormat = typeof BUSINESS_RULES.SUPPORTED_RECEIPT_FORMATS[number]

// Enums for type safety and better domain modeling
export enum ExpenseStatus {
  PENDING_APPROVAL = 'pending_approval',
  AUTO_APPROVED = 'auto_approved',
  APPROVED = 'approved',
  REJECTED = 'rejected'
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

// Value Objects
export interface Money {
  amount: number
  currency: SupportedCurrency
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
}

// Entities
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
}

// DTOs for API communication
export interface CreateExpenseDto {
  amount_idr: number
  description: string
  category: string
  expense_date: string // ISO string format
  receipt_url?: string
  receipt_filename?: string
}

// Frontend form DTO (used by forms)
// Frontend form DTO for expense creation
export interface CreateExpenseFormDto {
  description: string
  amount: number
  category: string
  expenseDate: Date
  receiptFile?: UploadedFileState // Changed from File to UploadedFileState
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

// API Response types - Based on actual API structure
export interface ExpensesApiResponse {
  expenses: ApiExpense[]
  limit: number
  offset: number
}

// Raw API expense structure (as returned by backend)
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

// Domain expense model (transformed from API response)
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

// Filter and search types
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

// Form state types
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

// File Upload Response from external API
export interface FileUploadResponse {
  originalname: string
  filename: string
  location: string
}

// Uploaded file state for forms
export interface UploadedFileState {
  file: File
  url: string
  filename: string
  uploading?: boolean
  error?: string
}
