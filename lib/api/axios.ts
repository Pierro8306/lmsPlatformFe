import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Queue of pending requests that failed due to 401
interface QueuedRequest {
  resolve: (value: string) => void
  reject: (reason: AxiosError) => void
}

let isRefreshing = false
let failedQueue: QueuedRequest[] = []

function processQueue(error: AxiosError | null, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token as string)
    }
  })
  failedQueue = []
}

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response interceptor — handle 401 and refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until token refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err: AxiosError) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        clearTokens()
        processQueue(error, null)
        isRefreshing = false
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })
        const newAccessToken: string = data.access
        setTokens(newAccessToken, refreshToken)
        processQueue(null, newAccessToken)
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        const axiosRefreshError = refreshError as AxiosError
        clearTokens()
        processQueue(axiosRefreshError, null)
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(axiosRefreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export { apiClient }
export default apiClient
