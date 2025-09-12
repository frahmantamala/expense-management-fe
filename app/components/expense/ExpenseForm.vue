<!--
  ExpenseForm Component
  Handles expense creation and editing with comprehensive validation
-->
<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
        Expense Title <span class="text-red-500">*</span>
      </label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        placeholder="Enter expense title"
        :disabled="isSubmitting"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': getFieldError('title') }"
        @blur="touchField('title')"
      >
      <p v-if="getFieldError('title')" class="mt-1 text-sm text-red-600">
        {{ getFieldError('title') }}
      </p>
    </div>

    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
        Description <span class="text-red-500">*</span>
      </label>
      <textarea
        id="description"
        v-model="formData.description"
        placeholder="Describe your expense"
        rows="3"
        :disabled="isSubmitting"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': getFieldError('description') }"
        @blur="touchField('description')"
      />
      <p v-if="getFieldError('description')" class="mt-1 text-sm text-red-600">
        {{ getFieldError('description') }}
      </p>
    </div>

    <!-- Amount and Currency -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
          Amount <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">{{ formData.currency }}</span>
          </div>
          <input
            id="amount"
            v-model.number="formData.amount"
            type="number"
            placeholder="0"
            :min="1"
            :max="BUSINESS_RULES.MAX_EXPENSE_AMOUNT"
            :disabled="isSubmitting"
            class="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': getFieldError('amount') }"
            @blur="touchField('amount')"
          >
        </div>
        <p v-if="getFieldError('amount')" class="mt-1 text-sm text-red-600">
          {{ getFieldError('amount') }}
        </p>
      </div>
      <div>
        <label for="currency" class="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
        <select
          id="currency"
          v-model="formData.currency"
          :disabled="isSubmitting"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option v-for="option in currencyOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Amount threshold warning -->
    <div v-if="showApprovalWarning" class="p-3 bg-orange-50 border border-orange-200 rounded-lg">
      <div class="flex items-start">
        <span class="w-5 h-5 text-orange-400 mt-0.5 mr-2">⚠️</span>
        <div>
          <p class="text-sm font-medium text-orange-800">Requires Manager Approval</p>
          <p class="text-xs text-orange-600 mt-1">
            Expenses above {{ formatCurrency(BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD, formData.currency) }} 
            require manager approval before payment processing.
          </p>
        </div>
      </div>
    </div>

    <!-- Category -->
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
        Category <span class="text-red-500">*</span>
      </label>
      <select
        id="category"
        v-model="formData.categoryId"
        :disabled="isSubmitting || categoriesLoading"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': getFieldError('categoryId') }"
        @blur="touchField('categoryId')"
      >
        <option value="">Select a category</option>
        <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <p v-if="getFieldError('categoryId')" class="mt-1 text-sm text-red-600">
        {{ getFieldError('categoryId') }}
      </p>
    </div>

    <!-- Receipt Upload -->
    <div>
      <label for="receipt" class="block text-sm font-medium text-gray-700 mb-1">
        Receipt
      </label>
      <p class="text-sm text-gray-500 mb-2">
        Optional. Supported formats: JPEG, PNG, PDF. Max size: {{ BUSINESS_RULES.RECEIPT_MAX_SIZE / 1024 / 1024 }}MB
      </p>
      <div class="space-y-3">
        <input
          id="receipt"
          ref="fileInput"
          type="file"
          :accept="BUSINESS_RULES.SUPPORTED_RECEIPT_FORMATS.join(',')"
          :disabled="isSubmitting"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 border border-gray-300 rounded-md"
          @change="handleFileChange"
        >
        
        <!-- File preview -->
        <div v-if="formData.receiptFile" class="flex items-center p-3 bg-gray-50 rounded-lg">
          <span class="w-8 h-8 text-gray-400 mr-3">
            {{ getFileIcon(formData.receiptFile.type) }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ formData.receiptFile.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatFileSize(formData.receiptFile.size) }}
            </p>
          </div>
          <button
            type="button"
            :disabled="isSubmitting"
            class="ml-3 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            @click="removeFile"
          >
            <span class="w-4 h-4">✕</span>
          </button>
        </div>
      </div>
      <p v-if="getFieldError('receiptFile')" class="mt-1 text-sm text-red-600">
        {{ getFieldError('receiptFile') }}
      </p>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-between pt-6 border-t border-gray-200">
      <button
        type="button"
        :disabled="isSubmitting"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      
      <div class="flex space-x-3">
        <button
          v-if="mode === 'edit'"
          type="button"
          :disabled="isSubmitting || !hasChanges"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          @click="resetToInitialState"
        >
          Reset
        </button>
        
        <button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <span v-if="isSubmitting" class="mr-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
          {{ mode === 'create' ? 'Submit Expense' : 'Update Expense' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { CreateExpenseDto } from '../../types/domain'
import { BUSINESS_RULES } from '../../types/domain'
import { useExpenseFormValidation } from '../../composables/useFormValidation'

interface Props {
  mode?: 'create' | 'edit'
  initialData?: Partial<CreateExpenseDto>
  categories?: Array<{ id: string; name: string; description?: string }>
  categoriesLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  initialData: undefined,
  categories: () => [],
  categoriesLoading: false
})

// Emits
defineEmits<{
  submit: [data: CreateExpenseDto]
  cancel: []
}>()

// Form validation
const {
  formData,
  isSubmitting,
  getFieldError,
  isFormValid,
  touchField,
  validateForm,
  resetForm
} = useExpenseFormValidation()

// File input ref
const fileInput = ref<HTMLInputElement>()

// Store initial state for reset functionality
const initialFormState = ref<typeof formData.value>()

// Currency options
const currencyOptions = computed(() => 
  BUSINESS_RULES.SUPPORTED_CURRENCIES.map(currency => ({
    label: currency,
    value: currency
  }))
)

// Category options
const categoryOptions = computed(() => 
  props.categories.map(category => ({
    label: category.name,
    value: category.id
  }))
)

// Show approval warning for high amounts
const showApprovalWarning = computed(() => {
  return formData.value.amount && formData.value.amount >= BUSINESS_RULES.AUTO_APPROVAL_THRESHOLD
})

// Check if form has changes (for edit mode)
const hasChanges = computed(() => {
  if (!initialFormState.value) return false
  
  return JSON.stringify(formData.value) !== JSON.stringify(initialFormState.value)
})

// File handling
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  formData.value.receiptFile = file
  touchField('receiptFile')
}

const removeFile = () => {
  formData.value.receiptFile = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) {
    return '🖼️'
  } else if (fileType === 'application/pdf') {
    return '📄'
  }
  return '📎'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Form submission
const handleSubmit = () => {
  // Touch all fields to show validation errors
  Object.keys(formData.value).forEach(field => touchField(field as keyof typeof formData.value))
  
  if (!validateForm()) {
    return
  }

  // Create submission data
  const submissionData: CreateExpenseDto = {
    title: formData.value.title,
    description: formData.value.description,
    amount: formData.value.amount!,
    currency: formData.value.currency,
    categoryId: formData.value.categoryId,
    receiptFile: formData.value.receiptFile || undefined
  }

  // Emit submit event
  // @ts-expect-error - emit function is available in script setup
  $emit('submit', submissionData)
}

// Reset form to initial state
const resetToInitialState = () => {
  if (initialFormState.value) {
    Object.assign(formData.value, { ...initialFormState.value })
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// Initialize form with initial data
const initializeForm = () => {
  if (props.initialData) {
    Object.assign(formData.value, {
      title: props.initialData.title || '',
      description: props.initialData.description || '',
      amount: props.initialData.amount || null,
      currency: props.initialData.currency || 'IDR',
      categoryId: props.initialData.categoryId || '',
      receiptFile: null // File inputs can't be pre-populated
    })
  }
  
  // Store initial state for reset functionality
  initialFormState.value = { ...formData.value }
}

// Watch for prop changes
watch(() => props.initialData, initializeForm, { immediate: true })

// Initialize on mount
onMounted(() => {
  initializeForm()
})

// Expose form methods for parent component
defineExpose({
  validateForm,
  resetForm,
  formData
})
</script>

<style scoped>
/* Custom styles for file input are handled inline with Tailwind classes */
</style>
