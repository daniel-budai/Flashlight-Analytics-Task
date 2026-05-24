import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MultiSelect } from '../../components/MultiSelect'

const OPTIONS = ['BMW', 'Audi', 'Toyota']

describe('MultiSelect', () => {
  it('renders label', () => {
    render(
      <MultiSelect
        label="Brand"
        options={OPTIONS}
        selected={[]}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Brand')).toBeInTheDocument()
  })

  it('renders all options as buttons', () => {
    render(
      <MultiSelect
        label="Brand"
        options={OPTIONS}
        selected={[]}
        onChange={vi.fn()}
      />,
    )
    OPTIONS.forEach((opt) => {
      expect(screen.getByRole('button', { name: opt })).toBeInTheDocument()
    })
  })

  it('shows empty state when no options', () => {
    render(
      <MultiSelect
        label="Brand"
        options={[]}
        selected={[]}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByText('No options available')).toBeInTheDocument()
  })

  it('calls onChange with added item on click', async () => {
    const onChange = vi.fn()
    render(
      <MultiSelect
        label="Brand"
        options={OPTIONS}
        selected={[]}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'BMW' }))
    expect(onChange).toHaveBeenCalledWith(['BMW'])
  })

  it('calls onChange with item removed when already selected', async () => {
    const onChange = vi.fn()
    render(
      <MultiSelect
        label="Brand"
        options={OPTIONS}
        selected={['BMW']}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'BMW' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('preserves existing selections when adding new item', async () => {
    const onChange = vi.fn()
    render(
      <MultiSelect
        label="Brand"
        options={OPTIONS}
        selected={['BMW']}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Audi' }))
    expect(onChange).toHaveBeenCalledWith(['BMW', 'Audi'])
  })
})
