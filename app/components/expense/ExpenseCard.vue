
<template>
  <div class="bg-white shadow rounded-lg border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ expense.title }}</h3>
      <ExpenseStatusBadge :status="expense.expenseStatus" />
    </div>
    
    <p class="text-gray-600 text-sm mb-3">{{ expense.description }}</p>
    
    <div class="flex items-center justify-between">
      <div>
        <p class="text-2xl font-bold text-gray-900">
          {{ formatCurrency(expense.amount, expense.currency) }}
        </p>
        <p class="text-sm text-gray-500">{{ expense.category?.name }}</p>
      </div>
      
      <div class="text-right">
        <p class="text-sm text-gray-500">
          {{ formatDate(expense.createdAt) }}
        </p>
        <PaymentStatusBadge 
          v-if="expense.paymentStatus" 
          :status="expense.paymentStatus" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Expense, SupportedCurrency } from '~/app/types/domain'
import { useCurrency } from '~/app/composables/useCurrency'

interface Props {
  expense: Expense
}

defineProps<Props>()

const { formatMoney } = useCurrency()

const formatCurrency = (amount: number, currency: string): string => {
  return formatMoney({ amount, currency: currency as SupportedCurrency })
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
