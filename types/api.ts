export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
  totalPages: number
  currentPage: number
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
  detail?: string
}
