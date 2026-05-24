import { MultiSelect } from './MultiSelect'
import { RangeInput } from './RangeInput'
import { hasActiveFilters, parseOptionalNumber } from '../lib/filters'
import type { CarFilters, SortField, StatsResponse } from '../types'

interface FilterPanelProps {
  filters: CarFilters
  stats: StatsResponse | undefined
  onChange: (patch: Partial<CarFilters>) => void
  onReset: () => void
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'date', label: 'Registration date' },
  { value: 'price', label: 'Price' },
  { value: 'mileage', label: 'Mileage' },
  { value: 'year', label: 'Year' },
]

export function FilterPanel({ filters, stats, onChange, onReset }: FilterPanelProps) {
  const brandOptions = stats?.avg_by_brand.map((b) => b.brand) ?? []
  const fuelOptions = stats?.count_by_fuel.map((f) => f.fuel_type) ?? []

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-200">Filters</h2>
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            Reset
          </button>
        )}
      </div>

      <div className="mt-4 space-y-5">
        <label
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
            filters.latest_only
              ? 'border-blue-800 bg-blue-950/40 text-blue-100'
              : 'border-slate-800 bg-slate-900 text-slate-300'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.latest_only}
            onChange={(e) => onChange({ latest_only: e.target.checked })}
            className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
          />
          Latest price only
          {filters.latest_only && (
            <span className="ml-auto text-xs text-blue-300/80">Default</span>
          )}
        </label>

        <MultiSelect
          label="Brand"
          options={brandOptions}
          selected={filters.brand}
          onChange={(brand) => onChange({ brand })}
        />

        <div>
          <span className="text-sm text-slate-400">Model</span>
          <input
            type="text"
            placeholder="Search model…"
            value={filters.model}
            onChange={(e) => onChange({ model: e.target.value })}
            className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="text-sm text-slate-400">Fuel type</span>
          <select
            value={filters.fuel_type}
            onChange={(e) => onChange({ fuel_type: e.target.value })}
            className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All</option>
            {fuelOptions.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </div>

        <RangeInput
          label="Price (€)"
          min={filters.price_min}
          max={filters.price_max}
          onMinChange={(price_min) => onChange({ price_min })}
          onMaxChange={(price_max) => onChange({ price_max })}
        />

        <RangeInput
          label="Mileage (km)"
          min={filters.mileage_min}
          max={filters.mileage_max}
          onMinChange={(mileage_min) => onChange({ mileage_min })}
          onMaxChange={(mileage_max) => onChange({ mileage_max })}
        />

        <div>
          <span className="text-sm text-slate-400">Year (exact)</span>
          <input
            type="number"
            placeholder="e.g. 2020"
            value={filters.year ?? ''}
            onChange={(e) => onChange({ year: parseOptionalNumber(e.target.value) })}
            className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <RangeInput
          label="Year range"
          min={filters.year_min}
          max={filters.year_max}
          onMinChange={(year_min) => onChange({ year_min })}
          onMaxChange={(year_max) => onChange({ year_max })}
          minPlaceholder="From"
          maxPlaceholder="To"
        />

        <div>
          <span className="text-sm text-slate-400">Sort by</span>
          <div className="mt-2 flex gap-2">
            <select
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortField })}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={filters.order}
              onChange={(e) =>
                onChange({ order: e.target.value as 'asc' | 'desc' })
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}
