import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS, useFilters } from '../../hooks/useFilters'

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useFilters', () => {
  it('returns default filters initially', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    expect(result.current.filters).toMatchObject(DEFAULT_FILTERS)
  })

  it('setFilters updates a single field', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    act(() => {
      result.current.setFilters({ fuel_type: 'Diesel' })
    })
    expect(result.current.filters.fuel_type).toBe('Diesel')
  })

  it('setFilters resets page to 1 on filter change', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    act(() => {
      result.current.setFilters({ page: 5 })
    })
    act(() => {
      result.current.setFilters({ fuel_type: 'Diesel' })
    })
    expect(result.current.filters.page).toBe(1)
  })

  it('setFilters preserves page when page is explicitly set', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    act(() => {
      result.current.setFilters({ page: 3 })
    })
    expect(result.current.filters.page).toBe(3)
  })

  it('resetFilters restores defaults', () => {
    const { result } = renderHook(() => useFilters(), { wrapper })
    act(() => {
      result.current.setFilters({ fuel_type: 'Diesel', brand: ['BMW'] })
    })
    act(() => {
      result.current.resetFilters()
    })
    expect(result.current.filters).toMatchObject(DEFAULT_FILTERS)
  })
})
