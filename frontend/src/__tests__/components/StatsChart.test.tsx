import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StatsChart } from '../../components/StatsChart'
import { DEFAULT_FILTERS } from '../../lib/filters'
import { mockStats } from '../../mocks/data'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}))

const defaultProps = {
  stats: mockStats,
  filters: DEFAULT_FILTERS,
  isLoading: false,
  isFetching: false,
  error: null,
}

describe('StatsChart', () => {
  it('shows loading state', () => {
    render(<StatsChart {...defaultProps} stats={undefined} isLoading={true} />)
    expect(screen.getByText(/loading stats/i)).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <StatsChart
        {...defaultProps}
        stats={undefined}
        error={new Error('failed')}
      />,
    )
    expect(screen.getByText(/failed to load stats/i)).toBeInTheDocument()
  })

  it('shows empty state when no stats', () => {
    render(<StatsChart {...defaultProps} stats={undefined} />)
    expect(screen.getByText(/import a csv/i)).toBeInTheDocument()
  })

  it('renders KPI cards', () => {
    render(<StatsChart {...defaultProps} />)
    expect(screen.getByText('Total cars')).toBeInTheDocument()
    expect(screen.getByText('Price records')).toBeInTheDocument()
    expect(screen.getByText('Avg price')).toBeInTheDocument()
    expect(screen.getByText('Price range')).toBeInTheDocument()
  })

  it('renders correct total cars value', () => {
    render(<StatsChart {...defaultProps} />)
    expect(screen.getByText('Total cars').parentElement).toHaveTextContent('3')
  })

  it('renders fuel type breakdown', () => {
    render(<StatsChart {...defaultProps} />)
    expect(screen.getByText(/petrol/i)).toBeInTheDocument()
    expect(screen.getByText(/diesel/i)).toBeInTheDocument()
  })

  it('shows updating indicator when fetching', () => {
    render(<StatsChart {...defaultProps} isFetching={true} />)
    expect(screen.getByText(/updating/i)).toBeInTheDocument()
  })

  it('shows filter notice when active filters present', () => {
    render(
      <StatsChart
        {...defaultProps}
        filters={{ ...DEFAULT_FILTERS, brand: ['BMW'] }}
      />,
    )
    expect(screen.getByText(/reflect the current filters/i)).toBeInTheDocument()
  })
})
