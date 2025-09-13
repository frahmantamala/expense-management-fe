
import { ref, computed, watch } from 'vue'
import { BUSINESS_RULES, type UploadedFileState } from '~/app/types/domain'

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

  
  const addRule = (field: keyof T, rule: ValidationRule) => {
    const fieldKey = field as string
    if (!validationRules.value[fieldKey]) {
      validationRules.value[fieldKey] = []
    }
    validationRules.value[fieldKey]!.push(rule)
    initializeFields()
  }

  
  const validateField = (field: keyof T): boolean => {
    const fieldKey = field as string
    const value = formData.value[field]
    const rules = validationRules.value[fieldKey] || []

    if (!fieldStates.value[fieldKey]) {
      return true
    }

    for (const rule of rules) {
      if (!rule.validate(value)) {
        fieldStates.value[fieldKey]!.error = rule.message
        return false
      }
    }

    fieldStates.value[fieldKey]!.error = null
    return true
  }

  
  const validateForm = (): boolean => {
    let isValid = true
    Object.keys(formData.value).forEach(field => {
      if (!validateField(field)) {
        isValid = false
      }
    })
    return isValid
  }

  
  const touchField = (field: keyof T) => {
    const fieldKey = field as string
    if (fieldStates.value[fieldKey]) {
      fieldStates.value[fieldKey].touched = true
    }
  }

  
  const resetForm = () => {
    formData.value = { ...initialState }
    Object.keys(fieldStates.value).forEach(key => {
      const fieldState = fieldStates.value[key]
      if (fieldState) {
        fieldState.error = null
        fieldState.touched = false
      }
    })
  }

  
  const getFieldError = (field: keyof T): string | null => {
    const fieldKey = field as string
    const fieldState = fieldStates.value[fieldKey]
    return fieldState?.touched ? fieldState.error : null
  }

  
  const hasFieldError = (field: keyof T): boolean => {
    return getFieldError(field) !== null
  }

  
  const hasErrors = computed(() => {
    return Object.values(fieldStates.value).some(field => field.error !== null)
  })

  const isFormValid = computed(() => {
    return !hasErrors.value && Object.keys(formData.value).length > 0
  })

  
  watch(formData, (newData) => {
    Object.keys(newData).forEach(field => {
      const fieldState = fieldStates.value[field]
      if (fieldState && fieldState.touched) {
        validateField(field)
      }
    })
  }, { deep: true })

  
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


export const useExpenseFormValidation = () => {
  const initialState = {
    description: '',
    amount: null as number | null,
    category: '',
    expenseDate: null as Date | null,
    receiptFile: null as UploadedFileState | null
  }

  const validation = useFormValidation(initialState)

  
  validation.addRule('description', {
    validate: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
    message: 'Description is required'
  })

  validation.addRule('description', {
    validate: (value: unknown) => typeof value === 'string' && value.trim().length >= BUSINESS_RULES.MIN_DESCRIPTION_LENGTH,
    message: `Description must be at least ${BUSINESS_RULES.MIN_DESCRIPTION_LENGTH} characters`
  })

  validation.addRule('description', {
    validate: (value: unknown) => typeof value === 'string' && value.length <= BUSINESS_RULES.MAX_DESCRIPTION_LENGTH,
    message: `Description must be less than ${BUSINESS_RULES.MAX_DESCRIPTION_LENGTH} characters`
  })

  validation.addRule('amount', {
    validate: (value: unknown) => value !== null && typeof value === 'number' && value > 0,
    message: 'Amount must be greater than 0'
  })

  validation.addRule('amount', {
    validate: (value: unknown) => {
      return value === null || (typeof value === 'number' && value <= BUSINESS_RULES.MAX_EXPENSE_AMOUNT)
    },
    message: `Amount must be less than ${BUSINESS_RULES.MAX_EXPENSE_AMOUNT.toLocaleString('id-ID')}`
  })

  validation.addRule('category', {
    validate: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
    message: 'Category is required'
  })

  validation.addRule('expenseDate', {
    validate: (value: unknown) => value !== null && value instanceof Date,
    message: 'Expense date is required'
  })

  validation.addRule('expenseDate', {
    validate: (value: unknown) => {
      if (!value || !(value instanceof Date)) return false
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return value <= today
    },
    message: 'Expense date cannot be in the future'
  })

  validation.addRule('expenseDate', {
    validate: (value: unknown) => {
      if (!value || !(value instanceof Date)) return false
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      return value >= oneYearAgo
    },
    message: 'Expense date cannot be more than 1 year ago'
  })

  validation.addRule('receiptFile', {
    validate: (value: unknown) => {
      if (!value) return true 
      if (typeof value !== 'object' || value === null) return false
      const uploadedFile = value as UploadedFileState
      return !uploadedFile.error && !!uploadedFile.url && !!uploadedFile.filename
    },
    message: 'Receipt file upload failed or is incomplete'
  })

  return validation
}


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
