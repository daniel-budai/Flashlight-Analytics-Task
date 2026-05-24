import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CarTable } from '../../components/CarTable'
import { mockPaginatedResponse } from '../../mocks/data'

describe('CarTable', () => {
  const defaultProps = {
    page: mockPaginatedResponse,
    isLoading: false,
    isFetching: false,
    error: null,
    onPageChange: vi.fn(),
  }

  it('shows loading state', () => {
    render(<CarTable {...defaultProps} page={undefined} isLoading={true} />)
    expect(screen.getByText(/loading cars/i)).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <CarTable
        {...defaultProps}
        page={undefined}
        error={new Error('Network error')}
      />,
    )
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })

  it('shows empty state when no results', () => {
    render(
      <CarTable
        {...defaultProps}
        page={{ ...mockPaginatedResponse, data: [], total: 0 }}
      />,
    )
    expect(screen.getByText(/no cars match/i)).toBeInTheDocument()
  })

  it('renders car rows', () => {
    render(<CarTable {...defaultProps} />)
    expect(screen.getByText('Toyota')).toBeInTheDocument()
    expect(screen.getByText('BMW')).toBeInTheDocument()
    expect(screen.getByText('Audi')).toBeInTheDocument()
  })

  it('shows updating indicator when fetching', () => {
    render(<CarTable {...defaultProps} isFetching={true} />)
    expect(screen.getByText(/updating/i)).toBeInTheDocument()
  })

  it('formats mileage with km suffix', () => {
    render(<CarTable {...defaultProps} />)
    expect(screen.getByText(/45,000 km/i)).toBeInTheDocument()
  })

  it('shows dash for null mileage', () => {
    render(<CarTable {...defaultProps} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('does not show pagination for single page', () => {
    render(<CarTable {...defaultProps} />)
    expect(
      screen.queryByRole('button', { name: /previous/i }),
    ).not.toBeInTheDocument()
  })

  it('shows pagination for multiple pages', () => {
    render(
      <CarTable
        {...defaultProps}
        page={{ ...mockPaginatedResponse, pages: 3, total: 60 }}
      />,
    )
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('previous button disabled on first page', () => {
    render(
      <CarTable
        {...defaultProps}
        page={{ ...mockPaginatedResponse, pages: 3, total: 60 }}
      />,
    )
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('calls onPageChange when next is clicked', async () => {
    const onPageChange = vi.fn()
    render(
      <CarTable
        {...defaultProps}
        page={{ ...mockPaginatedResponse, pages: 3, total: 60 }}
        onPageChange={onPageChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
