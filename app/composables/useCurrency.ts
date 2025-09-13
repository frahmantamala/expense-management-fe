/**
 * Currency Formatting Composable
 * Provides reactive currency formatting utilities for Vue components
 */

import { formatCurrency, formatCurrencyCompact, formatCurrencyInput, getCurrencySymbol, type Currency } from '~/app/utils/currency'
import type { Money } from '~/app/types/domain'

export function useCurrency() {
  /**
   * Format Money object to currency string
   */
  const formatMoney = (money: Money, options?: {
    showSymbol?: boolean
    compact?: boolean
    showCurrency?: boolean
  }) => {
    return formatCurrency(money.amount, money.currency, options)
  }

  /**
   * Format amount and currency separately to currency string
   */
  const format = (amount: number, currency: Currency = 'IDR', options?: {
    showSymbol?: boolean
    compact?: boolean
    showCurrency?: boolean
  }) => {
    return formatCurrency(amount, currency, options)
  }

  /**
   * Format Money object to compact currency string (e.g., 5.1M)
   */
  const formatMoneyCompact = (money: Money) => {
    return formatCurrencyCompact(money.amount, money.currency)
  }

  /**
   * Format Money object for input fields (no symbol)
   */
  const formatMoneyInput = (money: Money) => {
    return formatCurrencyInput(money.amount, money.currency)
  }

  /**
   * Get currency symbol for a given currency
   */
  const getSymbol = (currency: Currency) => {
    return getCurrencySymbol(currency)
  }

  /**
   * Create a computed formatter for Money objects
   */
  const createMoneyFormatter = (options?: {
    showSymbol?: boolean
    compact?: boolean
    showCurrency?: boolean
  }) => {
    return (money: Money) => formatMoney(money, options)
  }

  return {
    formatMoney,
    format,
    formatMoneyCompact,
    formatMoneyInput,
    getSymbol,
    createMoneyFormatter
  }
}
