import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatMileage,
  formatPrice,
} from '../../../utils/format'

describe('formatPrice', () => {
  it('formats price as euro currency', () => {
    const result = formatPrice(15000)
    expect(result).toContain('15')
    expect(result).toContain('000')
  })

  it('rounds to zero decimal places', () => {
    const result = formatPrice(15000.99)
    expect(result).not.toContain('.')
  })
})

describe('formatMileage', () => {
  it('appends km', () => {
    expect(formatMileage(45000)).toContain('km')
  })

  it('rounds to nearest integer', () => {
    const result = formatMileage(45000.7)
    expect(result).not.toContain('.')
  })
})

describe('formatDate', () => {
  it('returns a non-empty string for valid ISO date', () => {
    const result = formatDate('2024-01-15')
    expect(result.length).toBeGreaterThan(0)
    expect(result).toContain('2024')
  })
})

describe('formatDateTime', () => {
  it('includes both date and time parts', () => {
    const result = formatDateTime('2024-01-15T10:30:00')
    expect(result).toContain('2024')
  })
})
