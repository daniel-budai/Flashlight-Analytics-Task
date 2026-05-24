interface RangeInputProps {
  label: string
  min: number | null
  max: number | null
  onMinChange: (value: number | null) => void
  onMaxChange: (value: number | null) => void
  minPlaceholder?: string
  maxPlaceholder?: string
}

function parseNumberInput(raw: string): number | null {
  if (raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function RangeInput({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
}: RangeInputProps) {
  return (
    <div>
      <span className="text-sm text-slate-400">{label}</span>
      <div className="mt-2 flex gap-2">
        <input
          type="number"
          placeholder={minPlaceholder}
          value={min ?? ''}
          onChange={(e) => onMinChange(parseNumberInput(e.target.value))}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="number"
          placeholder={maxPlaceholder}
          value={max ?? ''}
          onChange={(e) => onMaxChange(parseNumberInput(e.target.value))}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  )
}
