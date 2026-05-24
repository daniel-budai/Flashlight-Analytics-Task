import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { CSVUpload } from '../../components/CSVUpload'

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('CSVUpload', () => {
  it('renders import button', () => {
    renderWithQuery(<CSVUpload />)
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()
  })

  it('import button disabled when no file selected', () => {
    renderWithQuery(<CSVUpload />)
    expect(screen.getByRole('button', { name: /import/i })).toBeDisabled()
  })

  it('import button enabled after file selected', async () => {
    renderWithQuery(<CSVUpload />)
    const file = new File(['brand,model\nToyota,Corolla'], 'test.csv', {
      type: 'text/csv',
    })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)
    expect(screen.getByRole('button', { name: /import/i })).not.toBeDisabled()
  })

  it('shows success feedback after import', async () => {
    renderWithQuery(<CSVUpload />)
    const file = new File(['brand,model\nToyota,Corolla'], 'test.csv', {
      type: 'text/csv',
    })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)
    await userEvent.click(screen.getByRole('button', { name: /import/i }))
    await waitFor(() => {
      expect(screen.getByText(/imported/i)).toBeInTheDocument()
    })
  })
})
