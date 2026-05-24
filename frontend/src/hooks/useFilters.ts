import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DEFAULT_FILTERS,
  filtersToSearchParams,
  searchParamsToFilters,
} from '../lib/filters'
import type { CarFilters } from '../types'

export { DEFAULT_FILTERS }

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams],
  )

  const setFilters = useCallback(
    (patch: Partial<CarFilters>) => {
      const next = { ...filters, ...patch }
      if (!('page' in patch)) {
        next.page = 1
      }
      setSearchParams(filtersToSearchParams(next), { replace: true })
    },
    [filters, setSearchParams],
  )

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  return { filters, setFilters, resetFilters }
}
