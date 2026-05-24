import { http, HttpResponse } from 'msw'
import { mockImportLogs, mockPaginatedResponse, mockStats } from './data'

export const handlers = [
  http.get('/api/cars', () => {
    return HttpResponse.json(mockPaginatedResponse)
  }),

  http.get('/api/stats', () => {
    return HttpResponse.json(mockStats)
  }),

  http.get('/api/imports', () => {
    return HttpResponse.json(mockImportLogs)
  }),

  http.post('/api/import', () => {
    return HttpResponse.json({ job_id: 1, status: 'pending' }, { status: 202 })
  }),

  http.get('/api/imports/jobs/:id', () => {
    return HttpResponse.json({
      id: 1,
      filename: 'test.csv',
      status: 'completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      result: {
        imported: 3,
        skipped: 0,
        duplicates: 0,
        invalid_rows: [],
        duplicate_rows: [],
      },
    })
  }),
]
