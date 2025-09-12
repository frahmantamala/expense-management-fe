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
import { ExpenseStatus } from '../../types/domain'

interface Props {
  status: ExpenseStatus
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  switch (props.status) {
    case ExpenseStatus.PENDING_APPROVAL:
      return {
        classes: 'bg-yellow-100 text-yellow-800',
        iconClasses: 'text-yellow-600',
        icon: '',
        label: 'Pending Approval'
      }
    case ExpenseStatus.AUTO_APPROVED:
      return {
        classes: 'bg-blue-100 text-blue-800',
        iconClasses: 'text-blue-600',
        icon: '',
        label: 'Auto Approved'
      }
    case ExpenseStatus.APPROVED:
      return {
        classes: 'bg-green-100 text-green-800',
        iconClasses: 'text-green-600',
        icon: '',
        label: 'Approved'
      }
    case ExpenseStatus.REJECTED:
      return {
        classes: 'bg-red-100 text-red-800',
        iconClasses: 'text-red-600',
        icon: '',
        label: 'Rejected'
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
