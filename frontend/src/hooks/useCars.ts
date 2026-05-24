import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCars } from '../api/cars'
import type { CarFilters } from '../types'

export function useCars(filters: CarFilters) {
  return useQuery({
    queryKey: ['cars', filters],
    queryFn: () => getCars(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}
