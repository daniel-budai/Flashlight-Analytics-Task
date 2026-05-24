import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RangeInput } from '../../components/RangeInput'

describe('RangeInput', () => {
  it('renders label', () => {
    render(
      <RangeInput
        label="Price (€)"
        min={null}
        max={null}
        onMinChange={vi.fn()}
        onMaxChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Price (€)')).toBeInTheDocument()
  })

  it('renders min and max placeholders', () => {
    render(
      <RangeInput
        label="Price"
        min={null}
        max={null}
        onMinChange={vi.fn()}
        onMaxChange={vi.fn()}
      />,
    )
    expect(screen.getByPlaceholderText('Min')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Max')).toBeInTheDocument()
  })

  it('renders custom placeholders', () => {
    render(
      <RangeInput
        label="Year"
        min={null}
        max={null}
        onMinChange={vi.fn()}
        onMaxChange={vi.fn()}
        minPlaceholder="From"
        maxPlaceholder="To"
      />,
    )
    expect(screen.getByPlaceholderText('From')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('To')).toBeInTheDocument()
  })

  it('calls onMinChange with parsed number', () => {
    const onMinChange = vi.fn()
    render(
      <RangeInput
        label="Price"
        min={null}
        max={null}
        onMinChange={onMinChange}
        onMaxChange={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByPlaceholderText('Min'), {
      target: { value: '10000' },
    })
    expect(onMinChange).toHaveBeenCalledWith(10000)
  })

  it('calls onMaxChange with null for empty input', async () => {
    const onMaxChange = vi.fn()
    render(
      <RangeInput
        label="Price"
        min={null}
        max={5000}
        onMinChange={vi.fn()}
        onMaxChange={onMaxChange}
      />,
    )
    const input = screen.getByPlaceholderText('Max')
    await userEvent.clear(input)
    expect(onMaxChange).toHaveBeenLastCalledWith(null)
  })

  it('shows current values in inputs', () => {
    render(
      <RangeInput
        label="Price"
        min={5000}
        max={20000}
        onMinChange={vi.fn()}
        onMaxChange={vi.fn()}
      />,
    )
    expect(screen.getByPlaceholderText('Min')).toHaveValue(5000)
    expect(screen.getByPlaceholderText('Max')).toHaveValue(20000)
  })
})
