/**
 * Form Validation Composable
 * Provides reusable form validation logic following DRY principles
 */

import { ref, computed, watch } from 'vue'
import { BUSINESS_RULES } from '../types/domain'

interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean
  message: string
}

interface FieldValidation {
  rules: ValidationRule[]
  value: unknown
  error: string | null
  touched: boolean
}

export const useFormValidation = <T extends Record<string, unknown>>(initialState: T) => {
  const formData = ref<T>({ ...initialState })
  const validationRules = ref<Record<string, ValidationRule[]>>({})
  const fieldStates = ref<Record<string, FieldValidation>>({})
  const isSubmitting = ref(false)

  // Initialize field states
  const initializeFields = () => {
    Object.keys(formData.value).forEach(key => {
      if (!fieldStates.value[key]) {
        fieldStates.value[key] = {
          rules: validationRules.value[key] || [],
          value: formData.value[key],
          error: null,
          touched: false
        }
      }
    })
  }

  // Add validation rules for a field
  const addRule = (field: keyof T, rule: ValidationRule) => {
    if (!validationRules.value[field as string]) {
      validationRules.value[field as string] = []
    }
    validationRules.value[field as string].push(rule)
    initializeFields()
  }

  // Validate a single field
  const validateField = (field: keyof T): boolean => {
    const fieldKey = field as string
    const value = formData.value[field]
    const rules = validationRules.value[fieldKey] || []

    for (const rule of rules) {
      if (!rule.validate(value)) {
        fieldStates.value[fieldKey].error = rule.message
        return false
      }
    }

    fieldStates.value[fieldKey].error = null
    return true
  }

  // Validate all fields
  const validateForm = (): boolean => {
    let isValid = true
    Object.keys(formData.value).forEach(field => {
      if (!validateField(field)) {
        isValid = false
      }
    })
    return isValid
  }

  // Mark field as touched
  const touchField = (field: keyof T) => {
    const fieldKey = field as string
    if (fieldStates.value[fieldKey]) {
      fieldStates.value[fieldKey].touched = true
    }
  }

  // Reset form
  const resetForm = () => {
    formData.value = { ...initialState }
    Object.keys(fieldStates.value).forEach(key => {
      fieldStates.value[key].error = null
      fieldStates.value[key].touched = false
    })
  }

  // Get errors for display
  const getFieldError = (field: keyof T): string | null => {
    const fieldKey = field as string
    const fieldState = fieldStates.value[fieldKey]
    return fieldState?.touched ? fieldState.error : null
  }

  // Check if field has error
  const hasFieldError = (field: keyof T): boolean => {
    return getFieldError(field) !== null
  }

  // Computed properties
  const hasErrors = computed(() => {
    return Object.values(fieldStates.value).some(field => field.error !== null)
  })

  const isFormValid = computed(() => {
    return !hasErrors.value && Object.keys(formData.value).length > 0
  })

  // Watch for changes and validate
  watch(formData, (newData) => {
    Object.keys(newData).forEach(field => {
      const fieldState = fieldStates.value[field]
      if (fieldState && fieldState.touched) {
        validateField(field)
      }
    })
  }, { deep: true })

  // Initialize on setup
  initializeFields()

  return {
    formData,
    isSubmitting,
    addRule,
    validateField,
    validateForm,
    touchField,
    resetForm,
    getFieldError,
    hasFieldError,
    hasErrors,
    isFormValid
  }
}

// Expense-specific validation composable
export const useExpenseFormValidation = () => {
  const initialState = {
    title: '',
    description: '',
    amount: null as number | null,
    currency: 'IDR',
    categoryId: '',
    receiptFile: null as File | null
  }

  const validation = useFormValidation(initialState)

  // Add expense-specific validation rules
  validation.addRule('title', {
    validate: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
    message: 'Title is required'
  })

  validation.addRule('title', {
    validate: (value: unknown) => typeof value === 'string' && value.length <= 100,
    message: 'Title must be less than 100 characters'
  })

  validation.addRule('description', {
    validate: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
    message: 'Description is required'
  })

  validation.addRule('description', {
    validate: (value: unknown) => typeof value === 'string' && value.length <= 500,
    message: 'Description must be less than 500 characters'
  })

  validation.addRule('amount', {
    validate: (value: unknown) => value !== null && typeof value === 'number' && value > 0,
    message: 'Amount must be greater than 0'
  })

  validation.addRule('amount', {
    validate: (value: unknown) => {
      return value === null || (typeof value === 'number' && value <= BUSINESS_RULES.MAX_EXPENSE_AMOUNT)
    },
    message: `Amount must be less than ${BUSINESS_RULES.MAX_EXPENSE_AMOUNT.toLocaleString()}`
  })

  validation.addRule('categoryId', {
    validate: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
    message: 'Category is required'
  })

  validation.addRule('receiptFile', {
    validate: (value: unknown) => {
      if (!value) return true // Optional field
      if (!(value instanceof File)) return false
      return value.size <= BUSINESS_RULES.RECEIPT_MAX_SIZE
    },
    message: 'Receipt file must be less than 5MB'
  })

  validation.addRule('receiptFile', {
    validate: (value: unknown) => {
      if (!value) return true // Optional field
      if (!(value instanceof File)) return false
      return BUSINESS_RULES.SUPPORTED_RECEIPT_FORMATS.includes(value.type as typeof BUSINESS_RULES.SUPPORTED_RECEIPT_FORMATS[number])
    },
    message: 'Receipt must be a JPEG, PNG, or PDF file'
  })

  return validation
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value: unknown) => {
      if (typeof value === 'string') return value.trim().length > 0
      return value !== null && value !== undefined
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') return false
      return value.length >= min
    },
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') return false
      return value.length <= max
    },
    message: message || `Must be less than ${max} characters`
  }),

  email: (message = 'Must be a valid email'): ValidationRule => ({
    validate: (value: unknown) => {
      if (typeof value !== 'string') return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message
  }),

  numeric: (message = 'Must be a number'): ValidationRule => ({
    validate: (value: unknown) => {
      return typeof value === 'number' && !isNaN(value)
    },
    message
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value: unknown) => {
      if (typeof value !== 'number') return false
      return value >= min
    },
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value: unknown) => {
      if (typeof value !== 'number') return false
      return value <= max
    },
    message: message || `Must be less than ${max}`
  })
}
