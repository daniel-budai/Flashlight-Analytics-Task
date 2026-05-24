import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getStats } from '../api/stats'
import { statsFiltersFrom } from '../lib/filters'
import type { CarFilters } from '../types'

export function useStats(filters: CarFilters) {
  const statsFilters = statsFiltersFrom(filters)

  return useQuery({
    queryKey: ['stats', statsFilters],
    queryFn: () => getStats(statsFilters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}
