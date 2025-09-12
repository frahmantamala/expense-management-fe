/**
 * Domain Types for Expense Management System
 * Following Domain-Driven Design principles
 */

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
  currency: string
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

export interface Expense {
  id: string
  title: string
  description: string
  amount: Money
  category: ExpenseCategory
  receiptUrl?: string
  submittedBy: User
  submittedAt: Date
  expenseStatus: ExpenseStatus
  paymentStatus: PaymentStatus | null
  approvedBy?: User
  approvedAt?: Date
  rejectedReason?: string
  paymentFailureReason?: string
  createdAt: Date
  updatedAt: Date
}

// DTOs for API communication
export interface CreateExpenseDto {
  title: string
  description: string
  amount: number
  currency: string
  categoryId: string
  receiptFile?: File
}

export interface UpdateExpenseDto {
  title?: string
  description?: string
  amount?: number
  categoryId?: string
}

export interface ApproveExpenseDto {
  approvalComment?: string
}

export interface RejectExpenseDto {
  rejectionReason: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
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
  limit?: number
  sortBy?: 'createdAt' | 'amount' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

// Form state types
export interface ExpenseFormState {
  title: string
  description: string
  amount: number | null
  currency: string
  categoryId: string
  receiptFile: File | null
}

export interface ExpenseFormErrors {
  title?: string
  description?: string
  amount?: string
  categoryId?: string
  receiptFile?: string
  general?: string
}

// Constants for business rules
export const BUSINESS_RULES = {
  AUTO_APPROVAL_THRESHOLD: 1000000, // 1M IDR
  MAX_EXPENSE_AMOUNT: 100000000, // 100M IDR
  SUPPORTED_CURRENCIES: ['IDR', 'USD'] as const,
  RECEIPT_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_RECEIPT_FORMATS: ['image/jpeg', 'image/png', 'application/pdf'] as const
} as const

export type SupportedCurrency = typeof BUSINESS_RULES.SUPPORTED_CURRENCIES[number]
export type SupportedReceiptFormat = typeof BUSINESS_RULES.SUPPORTED_RECEIPT_FORMATS[number]
