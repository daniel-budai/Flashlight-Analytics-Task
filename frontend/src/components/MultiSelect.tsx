interface MultiSelectProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  if (options.length === 0) {
    return (
      <div>
        <span className="text-sm text-slate-400">{label}</span>
        <p className="mt-2 text-sm text-slate-500">No options available</p>
      </div>
    )
  }

  return (
    <div>
      <span className="text-sm text-slate-400">{label}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
