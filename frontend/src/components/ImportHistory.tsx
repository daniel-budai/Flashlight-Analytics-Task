import { useQuery } from '@tanstack/react-query'
import { getImportLogs } from '../api/imports'
import { formatDateTime } from '../utils/format'

export function ImportHistory() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['imports'],
    queryFn: () => getImportLogs(5),
    staleTime: 30_000,
  })

  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-400">
        Loading import history…
      </section>
    )
  }

  if (logs.length === 0) {
    return null
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="text-sm font-medium text-slate-200">Recent imports</h2>
      <ul className="mt-3 space-y-2">
        {logs.map((log) => (
          <li
            key={log.id}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
          >
            <p className="font-medium text-slate-200">{log.filename}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {log.rows_ok} imported · {log.rows_error} skipped/errors ·{' '}
              {formatDateTime(log.created_at)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
