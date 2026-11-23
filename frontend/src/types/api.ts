export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
}

export interface ApiErrorPayload {
  message: string
  code?: string
  details?: unknown
}
