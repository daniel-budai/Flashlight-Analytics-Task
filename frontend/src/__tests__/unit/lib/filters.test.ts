import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FILTERS,
  filtersToApiParams,
  filtersToSearchParams,
  hasActiveFilters,
  parseOptionalNumber,
  searchParamsToFilters,
  statsFiltersFrom,
} from '../../../lib/filters'

describe('parseOptionalNumber', () => {
  it('returns null for empty string', () => {
    expect(parseOptionalNumber('')).toBeNull()
  })

  it('returns null for null', () => {
    expect(parseOptionalNumber(null)).toBeNull()
  })

  it('parses valid number', () => {
    expect(parseOptionalNumber('15000')).toBe(15000)
  })

  it('returns null for non-numeric string', () => {
    expect(parseOptionalNumber('abc')).toBeNull()
  })
})

describe('searchParamsToFilters', () => {
  it('returns defaults for empty params', () => {
    const filters = searchParamsToFilters(new URLSearchParams())
    expect(filters.latest_only).toBe(true)
    expect(filters.brand).toEqual([])
    expect(filters.page).toBe(1)
    expect(filters.per_page).toBe(20)
  })

  it('parses brand as array', () => {
    const filters = searchParamsToFilters(new URLSearchParams('brand=BMW,Audi'))
    expect(filters.brand).toEqual(['BMW', 'Audi'])
  })

  it('parses latest_only=false correctly', () => {
    const filters = searchParamsToFilters(
      new URLSearchParams('latest_only=false'),
    )
    expect(filters.latest_only).toBe(false)
  })

  it('parses numeric filters', () => {
    const filters = searchParamsToFilters(
      new URLSearchParams('price_min=10000&price_max=20000'),
    )
    expect(filters.price_min).toBe(10000)
    expect(filters.price_max).toBe(20000)
  })

  it('returns null for missing optional numbers', () => {
    const filters = searchParamsToFilters(new URLSearchParams())
    expect(filters.price_min).toBeNull()
    expect(filters.year).toBeNull()
  })

  it('falls back to default sort if invalid', () => {
    const filters = searchParamsToFilters(new URLSearchParams('sort=nonsense'))
    expect(filters.sort).toBe('date')
  })

  it('falls back to default order if invalid', () => {
    const filters = searchParamsToFilters(new URLSearchParams('order=random'))
    expect(filters.order).toBe('desc')
  })
})

describe('filtersToSearchParams', () => {
  it('omits default values from params', () => {
    const params = filtersToSearchParams(DEFAULT_FILTERS)
    expect(params.toString()).toBe('')
  })

  it('serializes brand array as comma-joined string', () => {
    const params = filtersToSearchParams({
      ...DEFAULT_FILTERS,
      brand: ['BMW', 'Audi'],
    })
    expect(params.get('brand')).toBe('BMW,Audi')
  })

  it('omits latest_only when true (it is the default)', () => {
    const params = filtersToSearchParams({
      ...DEFAULT_FILTERS,
      latest_only: true,
    })
    expect(params.has('latest_only')).toBe(false)
  })

  it('sets latest_only=false when disabled', () => {
    const params = filtersToSearchParams({
      ...DEFAULT_FILTERS,
      latest_only: false,
    })
    expect(params.get('latest_only')).toBe('false')
  })

  it('omits page 1 from params', () => {
    const params = filtersToSearchParams({ ...DEFAULT_FILTERS, page: 1 })
    expect(params.has('page')).toBe(false)
  })

  it('includes page > 1', () => {
    const params = filtersToSearchParams({ ...DEFAULT_FILTERS, page: 3 })
    expect(params.get('page')).toBe('3')
  })
})

describe('filtersToApiParams', () => {
  it('includes latest_only=true explicitly', () => {
    const params = filtersToApiParams({
      ...DEFAULT_FILTERS,
      latest_only: true,
    })
    expect(params.latest_only).toBe('true')
  })

  it('excludes pagination when includePagination is false', () => {
    const params = filtersToApiParams(
      { ...DEFAULT_FILTERS, page: 2 },
      { includePagination: false },
    )
    expect(params.page).toBeUndefined()
    expect(params.per_page).toBeUndefined()
  })
})

describe('hasActiveFilters', () => {
  it('returns false for default filters', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false)
  })

  it('returns true when brand is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, brand: ['BMW'] })).toBe(true)
  })

  it('returns true when latest_only is false', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, latest_only: false })).toBe(
      true,
    )
  })

  it('returns true when price_min is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, price_min: 10000 })).toBe(
      true,
    )
  })

  it('returns true when sort is changed', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, sort: 'price' })).toBe(true)
  })
})

describe('statsFiltersFrom', () => {
  it('resets page to 1', () => {
    const result = statsFiltersFrom({ ...DEFAULT_FILTERS, page: 5 })
    expect(result.page).toBe(1)
  })

  it('preserves other filters', () => {
    const result = statsFiltersFrom({ ...DEFAULT_FILTERS, brand: ['BMW'] })
    expect(result.brand).toEqual(['BMW'])
  })
})
