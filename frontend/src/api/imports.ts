import { apiClient } from './client'
import type { ImportLogEntry, ImportRowError, ImportSuccess } from '../types'

type ImportApiResponse = {
  imported?: number
  skipped?: number
  duplicates?: number
  invalid_rows?: ImportRowError[]
  duplicate_rows?: ImportRowError[]
  error?: string
}

export async function importCsv(file: File): Promise<ImportSuccess> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<ImportApiResponse>('/import', formData)
  return {
    ok: true,
    imported: data.imported ?? 0,
    skipped: data.skipped ?? 0,
    duplicates: data.duplicates ?? 0,
    invalid_rows: data.invalid_rows ?? [],
    duplicate_rows: data.duplicate_rows ?? [],
  }
}

export async function getImportLogs(limit = 10): Promise<ImportLogEntry[]> {
  const { data } = await apiClient.get<ImportLogEntry[]>('/imports', {
    params: { limit },
  })
  return data
}
