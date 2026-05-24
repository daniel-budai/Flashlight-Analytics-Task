export interface Car {
  id: number
  brand: string
  model: string
  year: number
  fuel_type: string
  mileage_km: number | null
  price: number
  registration_date: string
  source: string | null
}

export type SortField = 'price' | 'date' | 'mileage' | 'year'
export type SortOrder = 'asc' | 'desc'

export interface CarFilters {
  latest_only: boolean
  brand: string[]
  fuel_type: string
  model: string
  price_min: number | null
  price_max: number | null
  mileage_min: number | null
  mileage_max: number | null
  year: number | null
  year_min: number | null
  year_max: number | null
  sort: SortField
  order: SortOrder
  page: number
  per_page: number
}

export interface BrandAvgPrice {
  brand: string
  avg_price: number
}

export interface FuelCount {
  fuel_type: string
  count: number
}

export interface StatsResponse {
  total_cars: number
  total_prices: number
  avg_price: number | null
  min_price: number | null
  max_price: number | null
  avg_by_brand: BrandAvgPrice[]
  count_by_fuel: FuelCount[]
}

export interface ImportRowError {
  row: number
  reason: string
}

export type ImportSuccess = {
  ok: true
  imported: number
  skipped: number
  duplicates: number
  invalid_rows: ImportRowError[]
  duplicate_rows: ImportRowError[]
}

export type ImportResult =
  | ImportSuccess
  | {
      ok: false
      error: string
    }

export interface ImportLogEntry {
  id: number
  filename: string
  rows_ok: number
  rows_error: number
  created_at: string
}

export interface CarsPaginatedResponse {
  data: Car[]
  total: number
  page: number
  per_page: number
  pages: number
}
