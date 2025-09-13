<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
        Description <span class="text-red-500">*</span>
      </label>
      <textarea
        id="description"
        v-model="formData.description"
        placeholder="Describe your expense (e.g., Makan siang dengan klien)"
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

    <!-- Amount (IDR) -->
    <div>
      <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
        Amount<span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500 sm:text-sm">Rp</span>
        </div>
        <input
          id="amount"
          v-model.number="formData.amount"
          type="number"
          placeholder="50000"
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

    <!-- Category -->
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
        Category <span class="text-red-500">*</span>
      </label>
      <input
        id="category"
        v-model="formData.category"
        type="text"
        placeholder="e.g., makan, transport, meeting"
        :disabled="isSubmitting"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': getFieldError('category') }"
        @blur="touchField('category')"
      >
      <p v-if="getFieldError('category')" class="mt-1 text-sm text-red-600">
        {{ getFieldError('category') }}
      </p>
    </div>

    <!-- Expense Date -->
    <div>
      <label for="expenseDate" class="block text-sm font-medium text-gray-700 mb-1">
        Expense Date <span class="text-red-500">*</span>
      </label>
      <input
        id="expenseDate"
        v-model="expenseDateInput"
        type="date"
        :disabled="isSubmitting"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': getFieldError('expenseDate') }"
        @blur="touchField('expenseDate')"
      >
      <p v-if="getFieldError('expenseDate')" class="mt-1 text-sm text-red-600">
        {{ getFieldError('expenseDate') }}
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
        
        <!-- Upload Progress -->
        <div v-if="isUploading" class="flex items-center p-3 bg-blue-50 rounded-lg">
          <svg class="animate-spin w-5 h-5 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span class="text-sm text-blue-700">Uploading file...</span>
        </div>

        <!-- Upload Error -->
        <div v-else-if="uploadError" class="flex items-center p-3 bg-red-50 rounded-lg">
          <span class="w-5 h-5 text-red-500 mr-3">⚠️</span>
          <div class="flex-1">
            <p class="text-sm font-medium text-red-700">Upload failed</p>
            <p class="text-xs text-red-600">{{ uploadError }}</p>
          </div>
        </div>
        
        <!-- File preview -->
        <div v-else-if="formData.receiptFile && formData.receiptFile.url" class="flex items-center p-3 bg-green-50 rounded-lg">
          <span class="w-8 h-8 text-green-600 mr-3">
            {{ getFileIcon(formData.receiptFile.file.type) }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ formData.receiptFile.file.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatFileSize(formData.receiptFile.file.size) }} • Uploaded successfully
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

        <!-- Failed upload preview -->
        <div v-else-if="formData.receiptFile && formData.receiptFile.error" class="flex items-center p-3 bg-red-50 rounded-lg">
          <span class="w-8 h-8 text-red-500 mr-3">
            ⚠️
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-red-900 truncate">
              {{ formData.receiptFile.file.name }}
            </p>
            <p class="text-xs text-red-600">
              {{ formData.receiptFile.error }}
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
import type { CreateExpenseFormDto } from '~/app/types/domain'
import { BUSINESS_RULES } from '~/app/types/domain'
import { useExpenseFormValidation } from '~/app/composables/useFormValidation'
import { fileUploadService } from '~/app/services/fileUpload'

interface Props {
  mode?: 'create' | 'edit'
  initialData?: Partial<CreateExpenseFormDto>
  categoriesLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  initialData: undefined,
  categoriesLoading: false
})

const emit = defineEmits<{
  submit: [data: CreateExpenseFormDto]
  cancel: []
}>()

const {
  formData,
  isSubmitting,
  getFieldError,
  isFormValid,
  touchField,
  validateForm,
  resetForm
} = useExpenseFormValidation()

const fileInput = ref<HTMLInputElement>()

const initialFormState = ref<typeof formData.value>()

const isUploading = ref(false)
const uploadError = ref<string | null>(null)

const expenseDateInput = computed({
  get: () => {
    if (!formData.value.expenseDate) return ''
    const date = new Date(formData.value.expenseDate)
    return date.toISOString().split('T')[0]
  },
  set: (value: string) => {
    formData.value.expenseDate = value ? new Date(value) : null
  }
})

const hasChanges = computed(() => {
  if (!initialFormState.value) return false
  
  return JSON.stringify(formData.value) !== JSON.stringify(initialFormState.value)
})

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) {
    formData.value.receiptFile = null
    return
  }

  const validation = fileUploadService.validateFile(file)
  if (!validation.isValid) {
    uploadError.value = validation.error || 'Invalid file'
    touchField('receiptFile')
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    return
  }

  isUploading.value = true
  uploadError.value = null
  
  try {
    const uploadResult = await fileUploadService.uploadFile(file)
    
    formData.value.receiptFile = {
      file,
      url: uploadResult.url,
      filename: uploadResult.filename,
      uploading: false
    }
    
    touchField('receiptFile')
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : 'Upload failed'
    formData.value.receiptFile = {
      file,
      url: '',
      filename: '',
      uploading: false,
      error: uploadError.value
    }
    touchField('receiptFile')
  } finally {
    isUploading.value = false
  }
}

const removeFile = () => {
  formData.value.receiptFile = null
  uploadError.value = null
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

const handleSubmit = () => {
  // touch all fields to show validation errors
  Object.keys(formData.value).forEach(field => touchField(field as keyof typeof formData.value))
  
  if (!validateForm()) {
    return
  }

  // create submission data using CreateExpenseFormDto
  const submissionData: CreateExpenseFormDto = {
    description: formData.value.description,
    amount: formData.value.amount!,
    category: formData.value.category,
    expenseDate: formData.value.expenseDate!,
    receiptFile: formData.value.receiptFile || undefined
  }

  emit('submit', submissionData)
}

const resetToInitialState = () => {
  if (initialFormState.value) {
    Object.assign(formData.value, { ...initialFormState.value })
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const initializeForm = () => {
  if (props.initialData) {
    Object.assign(formData.value, {
      description: props.initialData.description || '',
      amount: props.initialData.amount || null,
      category: props.initialData.category || '',
      expenseDate: props.initialData.expenseDate || null,
      receiptFile: null
    })
  }
  
  initialFormState.value = { ...formData.value }
}

watch(() => props.initialData, initializeForm, { immediate: true })

onMounted(() => {
  initializeForm()
})

defineExpose({
  validateForm,
  resetForm,
  formData
})
</script>
