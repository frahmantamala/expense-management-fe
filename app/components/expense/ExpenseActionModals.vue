<template>
  <div>
    <!-- Approve Modal -->
    <div v-if="canShowApprove" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('cancel')" />
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto" style="z-index: 10000;">
        <div class="p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <span class="h-6 w-6 text-green-600">✅</span>
            </div>
            <div class="ml-4 w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">Approve Expense</h3>
              <p class="text-sm text-gray-500 mb-4">
                Approve "{{ selectedExpense?.title }}" for {{ formatCurrency(selectedExpense?.amount.amount || 0, selectedExpense?.amount.currency || 'IDR') }}?
              </p>
              <div>
                <label for="approval-comment" class="block text-sm font-medium text-gray-700 mb-2">Approval Notes (Optional)</label>
                <textarea
                  id="approval-comment"
                  v-model="approvalNotes"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add approval notes..."
                  rows="3"
                />
              </div>
            </div>
          </div>
          <div class="mt-6 flex space-x-3 justify-end">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="$emit('cancel')"
            >
              Cancel
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="processing"
              @click="handleApprove"
            >
              <span v-if="processing">Approving...</span>
              <span v-else>Approve</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="canShowReject" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('cancel')" />
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto" style="z-index: 10000;">
        <div class="p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <span class="h-6 w-6 text-red-600">❌</span>
            </div>
            <div class="ml-4 w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">Reject Expense</h3>
              <p class="text-sm text-gray-500 mb-4">
                Reject "{{ selectedExpense?.title }}"?
              </p>
              <div>
                <label for="rejection-reason" class="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                <textarea
                  id="rejection-reason"
                  v-model="rejectionReason"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide a reason for rejection..."
                  rows="3"
                  required
                />
              </div>
            </div>
          </div>
          <div class="mt-6 flex space-x-3 justify-end">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="$emit('cancel')"
            >
              Cancel
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="processing || !rejectionReason.trim()"
              @click="handleReject"
            >
              <span v-if="processing">Rejecting...</span>
              <span v-else>Reject</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Expense, SupportedCurrency } from '~/app/types/domain'
import { useCurrency } from '~/app/composables/useCurrency'

interface Props {
  showApprove: boolean
  showReject: boolean
  selectedExpense: Expense | null
  processing: boolean
  userPermissions?: {
    canApprove: boolean
    canReject: boolean
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'confirm-approve': [data: { notes?: string }]
  'confirm-reject': [data: { reason: string }]
  cancel: []
}>()

const approvalNotes = ref('')
const rejectionReason = ref('')

const canShowApprove = computed(() => {
  return props.showApprove && (props.userPermissions?.canApprove ?? true)
})

const canShowReject = computed(() => {
  return props.showReject && (props.userPermissions?.canReject ?? true)
})

const { formatMoney } = useCurrency()

const formatCurrency = (amount: number, currency: string): string => {
  return formatMoney({ amount, currency: currency as SupportedCurrency })
}

const handleApprove = () => {
  if (!props.userPermissions?.canApprove) {
    console.warn('User does not have permission to approve expenses')
    return
  }
  
  emit('confirm-approve', { notes: approvalNotes.value.trim() || undefined })
  approvalNotes.value = ''
}

const handleReject = () => {
  if (!props.userPermissions?.canReject) {
    console.warn('User does not have permission to reject expenses')
    return
  }
  
  if (rejectionReason.value.trim()) {
    emit('confirm-reject', { reason: rejectionReason.value.trim() })
    rejectionReason.value = ''
  }
}
</script>
