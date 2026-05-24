import type { Car, CarsPaginatedResponse } from '../types'
import { formatDate, formatMileage, formatPrice } from '../utils/format'

interface CarTableProps {
  page: CarsPaginatedResponse | undefined
  isLoading: boolean
  isFetching: boolean
  error: Error | null
  onPageChange: (page: number) => void
}

export function CarTable({
  page,
  isLoading,
  isFetching,
  error,
  onPageChange,
}: CarTableProps) {
  const cars = page?.data ?? []
  const total = page?.total ?? 0
  const currentPage = page?.page ?? 1
  const perPage = page?.per_page ?? 20
  const pages = page?.pages ?? 1
  const start = total === 0 ? 0 : (currentPage - 1) * perPage + 1

  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
        Loading cars…
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-sm text-red-300">
        Failed to load cars: {error.message}
      </section>
    )
  }

  if (total === 0) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
        No cars match the current filters.
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      {isFetching && (
        <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-xs text-slate-400">
          Updating results…
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Vehicle price listings</caption>
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th scope="col" className="px-4 py-3 font-medium">Brand</th>
              <th scope="col" className="px-4 py-3 font-medium">Model</th>
              <th scope="col" className="px-4 py-3 font-medium">Year</th>
              <th scope="col" className="px-4 py-3 font-medium">Fuel</th>
              <th scope="col" className="px-4 py-3 font-medium">Mileage</th>
              <th scope="col" className="px-4 py-3 font-medium">Price</th>
              <th scope="col" className="px-4 py-3 font-medium">Registration date</th>
              <th scope="col" className="px-4 py-3 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car: Car) => (
              <tr
                key={`${car.id}-${car.registration_date}-${car.source}-${car.price}`}
                className="border-b border-slate-800/60 hover:bg-slate-800/30"
              >
                <td className="px-4 py-3 text-slate-200">{car.brand}</td>
                <td className="px-4 py-3 text-slate-300">{car.model}</td>
                <td className="px-4 py-3 text-slate-300">{car.year}</td>
                <td className="px-4 py-3 text-slate-300">{car.fuel_type}</td>
                <td className="px-4 py-3 text-slate-300">
                  {car.mileage_km != null ? formatMileage(car.mileage_km) : '—'}
                </td>
                <td className="px-4 py-3 font-medium text-slate-100">
                  {formatPrice(car.price)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(car.registration_date)}
                </td>
                <td className="px-4 py-3 text-slate-400">{car.source ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
          <p className="text-sm text-slate-400">
            {start}–{Math.min(start + cars.length - 1, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous page"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="flex items-center px-2 text-sm text-slate-400">
              Page {currentPage} of {pages}
            </span>
            <button
              type="button"
              disabled={currentPage >= pages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next page"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
