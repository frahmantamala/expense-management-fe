<template>
  <span 
    :class="statusClasses"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  >
    <span :class="iconClasses" class="w-3 h-3 mr-1">
      {{ statusIcon }}
    </span>
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PaymentStatus } from '~/app/types/domain'

interface Props {
  status: PaymentStatus
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  switch (props.status) {
    case PaymentStatus.PENDING:
      return {
        classes: 'bg-gray-100 text-gray-800',
        iconClasses: 'text-gray-600',
        icon: '',
        label: 'Payment Pending'
      }
    case PaymentStatus.PROCESSING:
      return {
        classes: 'bg-blue-100 text-blue-800',
        iconClasses: 'text-blue-600',
        icon: '',
        label: 'Processing Payment'
      }
    case PaymentStatus.PAID:
      return {
        classes: 'bg-green-100 text-green-800',
        iconClasses: 'text-green-600',
        icon: '',
        label: 'Paid'
      }
    case PaymentStatus.FAILED:
      return {
        classes: 'bg-red-100 text-red-800',
        iconClasses: 'text-red-600',
        icon: '',
        label: 'Payment Failed'
      }
    default:
      return {
        classes: 'bg-gray-100 text-gray-800',
        iconClasses: 'text-gray-600',
        icon: '',
        label: 'Unknown'
      }
  }
})

const statusClasses = computed(() => statusConfig.value.classes)
const iconClasses = computed(() => statusConfig.value.iconClasses)
const statusIcon = computed(() => statusConfig.value.icon)
const statusLabel = computed(() => statusConfig.value.label)
</script>
