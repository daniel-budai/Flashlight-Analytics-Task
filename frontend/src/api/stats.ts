import { apiClient } from './client'
import { filtersToApiParams } from '../lib/filters'
import type { CarFilters, StatsResponse } from '../types'

export async function getStats(filters: CarFilters): Promise<StatsResponse> {
  const { data } = await apiClient.get<StatsResponse>('/stats', {
    params: filtersToApiParams(filters, { includePagination: false }),
  })
  return data
}
