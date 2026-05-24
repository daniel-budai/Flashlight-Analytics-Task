import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { hasActiveFilters } from '../lib/filters'
import type { CarFilters, StatsResponse } from '../types'
import { formatPrice } from '../utils/format'

interface StatsChartProps {
  stats: StatsResponse | undefined
  filters: CarFilters
  isLoading: boolean
  isFetching: boolean
  error: Error | null
}

export function StatsChart({
  stats,
  filters,
  isLoading,
  isFetching,
  error,
}: StatsChartProps) {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
        Loading stats…
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-sm text-red-300">
        Failed to load stats: {error.message}
      </section>
    )
  }

  if (!stats || stats.avg_by_brand.length === 0) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
        No stats available yet. Import a CSV to get started.
      </section>
    )
  }

  const chartData = stats.avg_by_brand.map((item) => ({
    brand: item.brand,
    avg_price: item.avg_price,
  }))

  const fuelData = stats.count_by_fuel.map((item) => ({
    fuel: item.fuel_type,
    count: item.count,
  }))

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-slate-200">
          Average price by brand
        </h2>
        {isFetching && (
          <span className="text-xs text-slate-500">Updating…</span>
        )}
      </div>

      {hasActiveFilters(filters) && (
        <p className="mt-1 text-xs text-slate-500">
          Stats reflect the current filters.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total cars" value={String(stats.total_cars)} />
        <StatCard label="Price records" value={String(stats.total_prices)} />
        <StatCard
          label="Avg price"
          value={stats.avg_price != null ? formatPrice(stats.avg_price) : '—'}
        />
        <StatCard
          label="Price range"
          value={
            stats.min_price != null && stats.max_price != null
              ? `${formatPrice(stats.min_price)} – ${formatPrice(stats.max_price)}`
              : '—'
          }
        />
      </div>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="brand"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
              interval={0}
              angle={chartData.length > 6 ? -30 : 0}
              textAnchor={chartData.length > 6 ? 'end' : 'middle'}
              height={chartData.length > 6 ? 60 : 30}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
              tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
              formatter={(value) => [formatPrice(Number(value)), 'Avg price']}
            />
            <Bar dataKey="avg_price" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {fuelData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-200">Cars by fuel type</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {fuelData.map((item) => (
              <li
                key={item.fuel}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300"
              >
                {item.fuel}: {item.count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  )
}
