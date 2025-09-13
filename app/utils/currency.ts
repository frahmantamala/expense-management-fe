/**
 * Currency Formatting Utilities
 * Provides consistent currency formatting across the application
 */

import type { SupportedCurrency } from '~/app/types/domain'

// Use the supported currencies from domain types, with fallback
export type Currency = SupportedCurrency

interface CurrencyConfig {
  locale: string
  currency: string
  symbol?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  IDR: {
    locale: 'id-ID',
    currency: 'IDR',
    symbol: 'Rp',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  USD: {
    locale: 'en-US',
    currency: 'USD',
    symbol: '$',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
}

/**
 * Format currency amount with proper locale and symbol
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'IDR',
  options: {
    showSymbol?: boolean
    compact?: boolean
    showCurrency?: boolean
  } = {}
): string {
  const {
    showSymbol = true,
    compact = false,
    showCurrency = false
  } = options

  const config = CURRENCY_CONFIGS[currency]
  if (!config) {
    throw new Error(`Unsupported currency: ${currency}`)
  }

  try {
    // For compact notation (e.g., 5.1M, 1.2K)
    if (compact && Math.abs(amount) >= 1000) {
      const formatter = new Intl.NumberFormat(config.locale, {
        notation: 'compact',
        compactDisplay: 'short',
        currency: config.currency,
        style: 'currency'
      })
      return formatter.format(amount)
    }

    // Standard formatting
    const formatter = new Intl.NumberFormat(config.locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: config.currency,
      minimumFractionDigits: config.minimumFractionDigits,
      maximumFractionDigits: config.maximumFractionDigits
    })

    let formatted = formatter.format(amount)

    // Add currency code if requested
    if (showCurrency && !showSymbol) {
      formatted = `${formatted} ${currency}`
    }

    return formatted
  } catch (error) {
    console.error('Error formatting currency:', error)
    // Fallback formatting
    return `${config.symbol || ''}${amount.toLocaleString(config.locale)}`
  }
}

/**
 * Format currency for display in lists/tables (shorter format)
 */
export function formatCurrencyCompact(
  amount: number,
  currency: Currency = 'IDR'
): string {
  return formatCurrency(amount, currency, { compact: true })
}

/**
 * Format currency for input fields (no symbol, decimal format)
 */
export function formatCurrencyInput(
  amount: number,
  currency: Currency = 'IDR'
): string {
  return formatCurrency(amount, currency, { 
    showSymbol: false,
    showCurrency: false 
  })
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(
  value: string,
  currency: Currency = 'IDR'
): number {
  const config = CURRENCY_CONFIGS[currency]
  
  // Remove currency symbols and spaces
  let cleaned = value
    .replace(new RegExp(config.symbol || '', 'g'), '')
    .replace(/[^\d.,-]/g, '')
  
  // Handle different decimal separators
  if (config.locale.includes('id') || config.locale.includes('de')) {
    // Indonesian/German format: 1.000.000,50
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    // US format: 1,000,000.50
    cleaned = cleaned.replace(/,/g, '')
  }
  
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Get currency symbol for a given currency
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_CONFIGS[currency]?.symbol || currency
}

/**
 * Validate if amount is within reasonable limits for currency
 */
export function validateCurrencyAmount(
  amount: number,
  currency: Currency = 'IDR'
): { isValid: boolean; message?: string } {
  if (amount < 0) {
    return { isValid: false, message: 'Amount cannot be negative' }
  }

  // Set reasonable limits per currency
  const limits: Record<Currency, number> = {
    IDR: 1000000000, 
    USD: 1000000     
  }

  if (amount > limits[currency]) {
    return { 
      isValid: false, 
      message: `Amount exceeds maximum limit of ${formatCurrency(limits[currency], currency)}` 
    }
  }

  return { isValid: true }
}
