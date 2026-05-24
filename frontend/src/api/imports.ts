import { apiClient } from './client'
import type {
  ImportJobAccepted,
  ImportJobResponse,
  ImportLogEntry,
  ImportRowError,
  ImportSuccess,
} from '../types'

const POLL_INTERVAL_MS = 1000
const MAX_POLL_ATTEMPTS = 120

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
  const { status, data } = await apiClient.post<
    ImportJobAccepted | ImportApiResponse
  >('/import', formData)

  if (status === 201) {
    return normalizeImportResult(data as ImportApiResponse)
  }

  const { job_id } = data as ImportJobAccepted
  return pollImportJob(job_id)
}

async function pollImportJob(jobId: number): Promise<ImportSuccess> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const { data: job } = await apiClient.get<ImportJobResponse>(
      `/imports/jobs/${jobId}`,
    )

    if (job.status === 'completed' && job.result) {
      return { ok: true, ...job.result }
    }
    if (job.status === 'failed') {
      throw new Error(job.error ?? 'Import failed')
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }
  throw new Error('Import timed out')
}

function normalizeImportResult(data: ImportApiResponse): ImportSuccess {
  if (data.error) {
    throw new Error(data.error)
  }
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
