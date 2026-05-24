import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { importCsv } from '../api/imports'
import type { ImportRowError, ImportSuccess } from '../types'

export function CSVUpload() {
  const [file, setFile] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: importCsv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['imports'] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    mutation.mutate(file)
  }

  const result = mutation.data ?? null
  const fetchError =
    mutation.error != null
      ? isAxiosError(mutation.error)
        ? `Import failed (${mutation.error.response?.status ?? 'unknown'})`
        : mutation.error instanceof Error
          ? mutation.error.message
          : 'Could not reach the backend. Is it running on port 5000?'
      : null

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="text-sm font-medium text-slate-200">Import CSV</h2>
      <p className="mt-1 text-sm text-slate-400">
        Upload vehicle price data to populate the dashboard.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm text-slate-400">CSV file</span>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              mutation.reset()
            }}
            className="mt-2 block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm file:mr-4 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-1 file:text-sm file:text-slate-200 hover:border-slate-600"
          />
        </label>

        <button
          type="submit"
          disabled={!file || mutation.isPending}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? 'Processing…' : 'Import'}
        </button>
      </form>

      {fetchError && (
        <p className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {fetchError}
        </p>
      )}

      {result && <ImportFeedback result={result} />}
    </section>
  )
}

function ImportFeedback({ result }: { result: ImportSuccess }) {
  const { imported, skipped, duplicates, invalid_rows, duplicate_rows } = result
  const alreadyUploaded = imported === 0 && duplicates > 0

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Imported" value={imported} />
        <Stat label="Skipped" value={skipped} />
        <Stat label="Duplicates" value={duplicates} />
      </div>

      {alreadyUploaded && (
        <p className="rounded-lg border border-blue-900 bg-blue-950/50 px-4 py-3 text-sm text-blue-200">
          Already uploaded — nothing new added. All valid rows are already in
          the database
          {duplicates > 0 ? ` (${duplicates} duplicate${duplicates === 1 ? '' : 's'})` : ''}.
        </p>
      )}

      {imported > 0 && (
        <p className="rounded-lg border border-emerald-900 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-200">
          Import complete — {imported} new record{imported === 1 ? '' : 's'} added.
        </p>
      )}

      {invalid_rows.length > 0 && (
        <ErrorList title="Invalid rows" rows={invalid_rows} />
      )}

      {duplicate_rows.length > 0 && (
        <ErrorList title="Duplicate rows" rows={duplicate_rows} tone="blue" />
      )}
    </div>
  )
}

function ErrorList({
  title,
  rows,
  tone = 'default',
}: {
  title: string
  rows: ImportRowError[]
  tone?: 'default' | 'blue'
}) {
  const border =
    tone === 'blue' ? 'border-blue-900/50' : 'border-slate-800'

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      <ul
        className={`mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border ${border} bg-slate-900 p-4 text-sm`}
      >
        {rows.map((err) => (
          <li key={`${err.row}-${err.reason}`} className="text-slate-300">
            <span className="text-slate-500">Line {err.row}:</span>{' '}
            {err.reason}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}
