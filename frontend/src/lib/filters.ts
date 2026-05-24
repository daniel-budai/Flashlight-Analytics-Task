import type { CarFilters, SortField, SortOrder } from '../types'

export const DEFAULT_FILTERS: CarFilters = {
  latest_only: true,
  brand: [],
  fuel_type: '',
  model: '',
  price_min: null,
  price_max: null,
  mileage_min: null,
  mileage_max: null,
  year: null,
  year_min: null,
  year_max: null,
  sort: 'date',
  order: 'desc',
  page: 1,
  per_page: 20,
}

const SORT_FIELDS: SortField[] = ['price', 'date', 'mileage', 'year']
const SORT_ORDERS: SortOrder[] = ['asc', 'desc']

export function parseOptionalNumber(raw: string | null): number | null {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (raw == null || raw === '') return fallback
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback
}

function parseSort(raw: string | null): SortField {
  return SORT_FIELDS.includes(raw as SortField) ? (raw as SortField) : 'date'
}

function parseOrder(raw: string | null): SortOrder {
  return SORT_ORDERS.includes(raw as SortOrder) ? (raw as SortOrder) : 'desc'
}

export function searchParamsToFilters(params: URLSearchParams): CarFilters {
  const brand = params.get('brand')

  return {
    latest_only: params.get('latest_only') !== 'false',
    brand: brand ? brand.split(',').filter(Boolean) : [],
    fuel_type: params.get('fuel_type') ?? '',
    model: params.get('model') ?? '',
    price_min: parseOptionalNumber(params.get('price_min')),
    price_max: parseOptionalNumber(params.get('price_max')),
    mileage_min: parseOptionalNumber(params.get('mileage_min')),
    mileage_max: parseOptionalNumber(params.get('mileage_max')),
    year: parseOptionalNumber(params.get('year')),
    year_min: parseOptionalNumber(params.get('year_min')),
    year_max: parseOptionalNumber(params.get('year_max')),
    sort: parseSort(params.get('sort')),
    order: parseOrder(params.get('order')),
    page: parsePositiveInt(params.get('page'), 1),
    per_page: parsePositiveInt(params.get('per_page'), DEFAULT_FILTERS.per_page),
  }
}

export function filtersToSearchParams(filters: CarFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (!filters.latest_only) params.set('latest_only', 'false')
  if (filters.brand.length > 0) params.set('brand', filters.brand.join(','))
  if (filters.fuel_type) params.set('fuel_type', filters.fuel_type)
  if (filters.model) params.set('model', filters.model)
  if (filters.price_min != null) params.set('price_min', String(filters.price_min))
  if (filters.price_max != null) params.set('price_max', String(filters.price_max))
  if (filters.mileage_min != null) params.set('mileage_min', String(filters.mileage_min))
  if (filters.mileage_max != null) params.set('mileage_max', String(filters.mileage_max))
  if (filters.year != null) params.set('year', String(filters.year))
  if (filters.year_min != null) params.set('year_min', String(filters.year_min))
  if (filters.year_max != null) params.set('year_max', String(filters.year_max))
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort)
  if (filters.order !== DEFAULT_FILTERS.order) params.set('order', filters.order)
  if (filters.page > 1) params.set('page', String(filters.page))
  if (filters.per_page !== DEFAULT_FILTERS.per_page) {
    params.set('per_page', String(filters.per_page))
  }

  return params
}

export function filtersToApiParams(
  filters: CarFilters,
  options: { includePagination?: boolean } = { includePagination: true },
): Record<string, string> {
  const params = filtersToSearchParams(filters)
  const apiParams = Object.fromEntries(params.entries())

  if (!options.includePagination) {
    delete apiParams.page
    delete apiParams.per_page
  }

  if (filters.latest_only) {
    apiParams.latest_only = 'true'
  }

  return apiParams
}

export function statsFiltersFrom(filters: CarFilters): CarFilters {
  return { ...filters, page: 1, per_page: DEFAULT_FILTERS.per_page }
}

export function hasActiveFilters(filters: CarFilters): boolean {
  return (
    filters.brand.length > 0 ||
    filters.fuel_type !== '' ||
    filters.model !== '' ||
    filters.price_min != null ||
    filters.price_max != null ||
    filters.mileage_min != null ||
    filters.mileage_max != null ||
    filters.year != null ||
    filters.year_min != null ||
    filters.year_max != null ||
    !filters.latest_only ||
    filters.sort !== DEFAULT_FILTERS.sort ||
    filters.order !== DEFAULT_FILTERS.order
  )
}
