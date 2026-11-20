import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/auth';

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
// Ensure BASE_URL doesn't have duplicate /api or trailing slash
const BASE_URL = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Queue of pending requests that failed due to 401
interface QueuedRequest {
  resolve: (value: string) => void;
  reject: (reason: AxiosError) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

function processQueue(error: AxiosError | null, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
}

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — unwrap Spring Boot ResponseObject & handle 401 token refresh
apiClient.interceptors.response.use(
  (response) => {
    // If backend returns Spring Boot ResponseObject: { status: "SUCCESS" | "FAILED", message: "...", data: ... }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'status' in response.data &&
      'message' in response.data &&
      'data' in response.data
    ) {
      if (response.data.status === 'FAILED') {
        const err = new Error(response.data.message || 'Yêu cầu không thành công');
        return Promise.reject(err);
      }
      // Unwrap data to response.data so callers get actual payload
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Format error message from server if available
    const errResponseData = error.response?.data as { status?: string; message?: string } | undefined;
    if (errResponseData?.message) {
      error.message = errResponseData.message;
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until token refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err: AxiosError) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        processQueue(error, null);
        isRefreshing = false;
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken: refreshToken,
        });

        // BE response is ResponseObject with data: { role, token, refreshToken }
        const payload = data?.data || data;
        const newAccessToken: string = payload.token || payload.access;
        const newRefreshToken: string = payload.refreshToken || payload.refresh || refreshToken;

        setTokens(newAccessToken, newRefreshToken, payload.role);
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        const axiosRefreshError = refreshError as AxiosError;
        clearTokens();
        processQueue(axiosRefreshError, null);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(axiosRefreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
