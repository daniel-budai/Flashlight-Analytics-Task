import { apiClient } from './client'
import { filtersToApiParams } from '../lib/filters'
import type { CarFilters, CarsPaginatedResponse } from '../types'

export async function getCars(filters: CarFilters): Promise<CarsPaginatedResponse> {
  const { data } = await apiClient.get<CarsPaginatedResponse>('/cars', {
    params: filtersToApiParams(filters),
  })
  return data
}
