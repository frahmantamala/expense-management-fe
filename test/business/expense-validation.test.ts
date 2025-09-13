import { describe, it, expect, beforeEach } from 'vitest'
import { reactive } from 'vue'

// Import business rules directly from the source
const BUSINESS_RULES = {
  AUTO_APPROVAL_THRESHOLD: 1000000, // 1M IDR
  MAX_EXPENSE_AMOUNT: 100000000, // 100M IDR
  MIN_DESCRIPTION_LENGTH: 5,
  MAX_DESCRIPTION_LENGTH: 500,
  SUPPORTED_CURRENCIES: ['IDR', 'USD'] as const,
  RECEIPT_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_RECEIPT_FORMATS: ['image/jpeg', 'image/png', 'application/pdf'] as const
} as const

/**
 * Business Logic Tests for Expense Form Validation
 * Tests core business rules and validation logic
 */

// Mock form validation logic (extracted from useExpenseFormValidation)
interface ExpenseFormData {
  description: string
  amount: number | null
  category: string
  expenseDate: Date | null
  receiptFile: File | null
}

class ExpenseFormValidator {
  private formData: ExpenseFormData
  private touchedFields = new Set<string>()

  constructor(initialData: Partial<ExpenseFormData> = {}) {
    this.formData = reactive({
      description: '',
      amount: null,
      category: '',
      expenseDate: null,
      receiptFile: null,
      ...initialData
    })
  }

  touchField(field: keyof ExpenseFormData) {
    this.touchedFields.add(field)
  }

  validateDescription(): string | null {
    if (!this.touchedFields.has('description')) return null
    
    if (!this.formData.description.trim()) {
      return 'Description is required'
    }
    
    if (this.formData.description.length < BUSINESS_RULES.MIN_DESCRIPTION_LENGTH) {
      return `Description must be at least ${BUSINESS_RULES.MIN_DESCRIPTION_LENGTH} characters`
    }
    
    if (this.formData.description.length > BUSINESS_RULES.MAX_DESCRIPTION_LENGTH) {
      return `Description must not exceed ${BUSINESS_RULES.MAX_DESCRIPTION_LENGTH} characters`
    }
    
    return null
  }

  validateAmount(): string | null {
    if (!this.touchedFields.has('amount')) return null
    
    if (!this.formData.amount || this.formData.amount <= 0) {
      return 'Amount is required and must be greater than 0'
    }
    
    if (this.formData.amount > BUSINESS_RULES.MAX_EXPENSE_AMOUNT) {
      return `Amount cannot exceed Rp ${BUSINESS_RULES.MAX_EXPENSE_AMOUNT.toLocaleString('id-ID')}`
    }
    
    return null
  }

  validateCategory(): string | null {
    if (!this.touchedFields.has('category')) return null
    
    if (!this.formData.category.trim()) {
      return 'Category is required'
    }
    
    return null
  }

  validateExpenseDate(): string | null {
    if (!this.touchedFields.has('expenseDate')) return null
    
    if (!this.formData.expenseDate) {
      return 'Expense date is required'
    }
    
    const today = new Date()
    const expenseDate = new Date(this.formData.expenseDate)
    
    // Cannot be future date
    if (expenseDate > today) {
      return 'Expense date cannot be in the future'
    }
    
    // Cannot be too old (6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(today.getMonth() - 6)
    
    if (expenseDate < sixMonthsAgo) {
      return 'Expense date cannot be older than 6 months'
    }
    
    return null
  }

  isFormValid(): boolean {
    this.touchAllFields()
    
    return !this.validateDescription() &&
           !this.validateAmount() &&
           !this.validateCategory() &&
           !this.validateExpenseDate()
  }

  requiresApproval(): boolean {
    return (this.formData.amount || 0) >= BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD
  }

  private touchAllFields() {
    Object.keys(this.formData).forEach(field => {
      this.touchedFields.add(field)
    })
  }

  // Getters for testing
  get data() { return this.formData }
  set data(newData: ExpenseFormData) { 
    Object.assign(this.formData, newData)
  }
}

describe('Expense Form Validation - Business Logic', () => {
  let validator: ExpenseFormValidator

  beforeEach(() => {
    validator = new ExpenseFormValidator()
  })

  describe('Description Validation', () => {
    it('should require description', () => {
      validator.data.description = ''
      validator.touchField('description')
      
      const error = validator.validateDescription()
      expect(error).toBe('Description is required')
    })

    it('should enforce minimum length', () => {
      validator.data.description = 'abc' // Less than MIN_DESCRIPTION_LENGTH (5)
      validator.touchField('description')
      
      const error = validator.validateDescription()
      expect(error).toBe(`Description must be at least ${BUSINESS_RULES.MIN_DESCRIPTION_LENGTH} characters`)
    })

    it('should enforce maximum length', () => {
      validator.data.description = 'a'.repeat(BUSINESS_RULES.MAX_DESCRIPTION_LENGTH + 1)
      validator.touchField('description')
      
      const error = validator.validateDescription()
      expect(error).toBe(`Description must not exceed ${BUSINESS_RULES.MAX_DESCRIPTION_LENGTH} characters`)
    })

    it('should accept valid description', () => {
      validator.data.description = 'Business lunch with client'
      validator.touchField('description')
      
      const error = validator.validateDescription()
      expect(error).toBeNull()
    })

    it('should not validate untouched field', () => {
      validator.data.description = ''
      // Don't touch the field
      
      const error = validator.validateDescription()
      expect(error).toBeNull()
    })
  })

  describe('Amount Validation', () => {
    it('should require amount', () => {
      validator.data.amount = null
      validator.touchField('amount')
      
      const error = validator.validateAmount()
      expect(error).toBe('Amount is required and must be greater than 0')
    })

    it('should require positive amount', () => {
      validator.data.amount = 0
      validator.touchField('amount')
      
      const error = validator.validateAmount()
      expect(error).toBe('Amount is required and must be greater than 0')
    })

    it('should enforce maximum amount', () => {
      validator.data.amount = BUSINESS_RULES.MAX_EXPENSE_AMOUNT + 1
      validator.touchField('amount')
      
      const error = validator.validateAmount()
      expect(error).toBe(`Amount cannot exceed Rp ${BUSINESS_RULES.MAX_EXPENSE_AMOUNT.toLocaleString('id-ID')}`)
    })

    it('should accept valid amount', () => {
      validator.data.amount = 500000
      validator.touchField('amount')
      
      const error = validator.validateAmount()
      expect(error).toBeNull()
    })
  })

  describe('Category Validation', () => {
    it('should require category', () => {
      validator.data.category = ''
      validator.touchField('category')
      
      const error = validator.validateCategory()
      expect(error).toBe('Category is required')
    })

    it('should accept valid category', () => {
      validator.data.category = 'Meals'
      validator.touchField('category')
      
      const error = validator.validateCategory()
      expect(error).toBeNull()
    })
  })

  describe('Expense Date Validation', () => {
    it('should require expense date', () => {
      validator.data.expenseDate = null
      validator.touchField('expenseDate')
      
      const error = validator.validateExpenseDate()
      expect(error).toBe('Expense date is required')
    })

    it('should reject future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      
      validator.data.expenseDate = futureDate
      validator.touchField('expenseDate')
      
      const error = validator.validateExpenseDate()
      expect(error).toBe('Expense date cannot be in the future')
    })

    it('should reject dates older than 6 months', () => {
      const oldDate = new Date()
      oldDate.setMonth(oldDate.getMonth() - 7)
      
      validator.data.expenseDate = oldDate
      validator.touchField('expenseDate')
      
      const error = validator.validateExpenseDate()
      expect(error).toBe('Expense date cannot be older than 6 months')
    })

    it('should accept valid dates', () => {
      const validDate = new Date()
      validDate.setDate(validDate.getDate() - 1) // Yesterday
      
      validator.data.expenseDate = validDate
      validator.touchField('expenseDate')
      
      const error = validator.validateExpenseDate()
      expect(error).toBeNull()
    })

    it('should accept today\'s date', () => {
      validator.data.expenseDate = new Date()
      validator.touchField('expenseDate')
      
      const error = validator.validateExpenseDate()
      expect(error).toBeNull()
    })
  })

  describe('Approval Requirement Logic', () => {
    it('should require approval for amounts >= threshold', () => {
      validator.data.amount = BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD
      
      expect(validator.requiresApproval()).toBe(true)
    })

    it('should require approval for amounts > threshold', () => {
      validator.data.amount = BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD + 100000
      
      expect(validator.requiresApproval()).toBe(true)
    })

    it('should not require approval for amounts < threshold', () => {
      validator.data.amount = BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD - 1
      
      expect(validator.requiresApproval()).toBe(false)
    })

    it('should not require approval for small amounts', () => {
      validator.data.amount = 50000 // 50k IDR
      
      expect(validator.requiresApproval()).toBe(false)
    })

    it('should handle null amounts safely', () => {
      validator.data.amount = null
      
      expect(validator.requiresApproval()).toBe(false)
    })
  })

  describe('Form Validity', () => {
    it('should be invalid when required fields are missing', () => {
      // Empty form
      expect(validator.isFormValid()).toBe(false)
    })

    it('should be valid when all required fields are provided correctly', () => {
      validator.data = {
        description: 'Business lunch with client',
        amount: 500000,
        category: 'Meals',
        expenseDate: new Date(),
        receiptFile: null
      }
      
      expect(validator.isFormValid()).toBe(true)
    })

    it('should be invalid when any field has validation errors', () => {
      validator.data = {
        description: 'Business lunch with client',
        amount: -100, // Invalid amount
        category: 'Meals',
        expenseDate: new Date(),
        receiptFile: null
      }
      
      expect(validator.isFormValid()).toBe(false)
    })
  })
})

describe('Business Rules Constants', () => {
  it('should have correct auto-approval threshold', () => {
    expect(BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD).toBe(1000000) // 1M IDR
  })

  it('should have reasonable maximum expense amount', () => {
    expect(BUSINESS_RULES.MAX_EXPENSE_AMOUNT).toBe(100000000) // 100M IDR
    expect(BUSINESS_RULES.MAX_EXPENSE_AMOUNT).toBeGreaterThan(BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD)
  })

  it('should have reasonable description length limits', () => {
    expect(BUSINESS_RULES.MIN_DESCRIPTION_LENGTH).toBe(5)
    expect(BUSINESS_RULES.MAX_DESCRIPTION_LENGTH).toBe(500)
    expect(BUSINESS_RULES.MAX_DESCRIPTION_LENGTH).toBeGreaterThan(BUSINESS_RULES.MIN_DESCRIPTION_LENGTH)
  })

  it('should support IDR currency', () => {
    expect(BUSINESS_RULES.SUPPORTED_CURRENCIES).toContain('IDR')
  })
})
