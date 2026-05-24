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
    return HttpResponse.json(
      {
        imported: 3,
        skipped: 0,
        duplicates: 0,
        invalid_rows: [],
        duplicate_rows: [],
      },
      { status: 201 },
    )
  }),
]
