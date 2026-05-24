import { CSVUpload } from './components/CSVUpload'
import { CarTable } from './components/CarTable'
import { FilterPanel } from './components/FilterPanel'
import { ImportHistory } from './components/ImportHistory'
import { StatsChart } from './components/StatsChart'
import { useCars } from './hooks/useCars'
import { useFilters } from './hooks/useFilters'
import { useStats } from './hooks/useStats'

export default function App() {
  const { filters, setFilters, resetFilters } = useFilters()
  const carsQuery = useCars(filters)
  const statsQuery = useStats(filters)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Flashlight Analytics
          </h1>
          <p className="mt-2 text-slate-400">
            Vehicle price analytics — filter, explore, and import data.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <CSVUpload />
            <ImportHistory />
            <FilterPanel
              filters={filters}
              stats={statsQuery.data}
              onChange={setFilters}
              onReset={resetFilters}
            />
          </aside>

          <div className="space-y-6">
            <StatsChart
              stats={statsQuery.data}
              filters={filters}
              isLoading={statsQuery.isLoading}
              isFetching={statsQuery.isFetching}
              error={statsQuery.error}
            />
            <CarTable
              page={carsQuery.data}
              isLoading={carsQuery.isLoading}
              isFetching={carsQuery.isFetching}
              error={carsQuery.error}
              onPageChange={(page) => setFilters({ page })}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
