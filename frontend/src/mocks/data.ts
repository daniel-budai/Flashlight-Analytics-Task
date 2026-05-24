import type {
  Car,
  CarsPaginatedResponse,
  ImportLogEntry,
  StatsResponse,
} from '../types'

export const mockCars: Car[] = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    fuel_type: 'Petrol',
    mileage_km: 45000,
    price: 15000,
    registration_date: '2024-01-15',
    source: 'siteA',
  },
  {
    id: 2,
    brand: 'BMW',
    model: '320i',
    year: 2019,
    fuel_type: 'Diesel',
    mileage_km: 60000,
    price: 22000,
    registration_date: '2024-03-10',
    source: null,
  },
  {
    id: 3,
    brand: 'Audi',
    model: 'A4',
    year: 2021,
    fuel_type: 'Petrol',
    mileage_km: null,
    price: 25000,
    registration_date: '2024-02-01',
    source: 'siteB',
  },
]

export const mockPaginatedResponse: CarsPaginatedResponse = {
  data: mockCars,
  total: 3,
  page: 1,
  per_page: 20,
  pages: 1,
}

export const mockStats: StatsResponse = {
  total_cars: 3,
  total_prices: 3,
  avg_price: 20666.67,
  min_price: 15000,
  max_price: 25000,
  avg_by_brand: [
    { brand: 'Audi', avg_price: 25000 },
    { brand: 'BMW', avg_price: 22000 },
    { brand: 'Toyota', avg_price: 15000 },
  ],
  count_by_fuel: [
    { fuel_type: 'Petrol', count: 2 },
    { fuel_type: 'Diesel', count: 1 },
  ],
}

export const mockImportLogs: ImportLogEntry[] = [
  {
    id: 1,
    filename: 'cars.csv',
    rows_ok: 3,
    rows_error: 0,
    created_at: '2024-01-15T10:30:00',
  },
]
