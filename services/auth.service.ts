import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { sleep } from '@/lib/utils';
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from '@/types/auth';
import type { ChangePasswordRequest } from '@/types/user';

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

const mockAdminUser: User = {
  id: 1,
  username: 'admin',
  email: 'admin@eduflow.dev',
  firstName: 'Alice',
  lastName: 'Administrator',
  role: 'admin',
  group: null,
  avatar: null,
  bio: 'Senior Technical Lead & LMS Platform Administrator.',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockStudentUser: User = {
  id: 2,
  username: 'student',
  email: 'student@eduflow.dev',
  firstName: 'Alex',
  lastName: 'Rivers',
  role: 'student',
  group: 'Group Alpha (CS-2025)',
  avatar: null,
  bio: 'Computer Science sophomore passionate about web development and algorithms.',
  isActive: true,
  createdAt: '2024-02-01T00:00:00Z',
  updatedAt: '2024-02-15T10:00:00Z',
};

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  if (HAS_API) {
    const { data } = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    return data;
  }
  await sleep(600);

  const usernameLower = credentials.username.toLowerCase().trim();

  if (usernameLower === 'admin' || usernameLower === 'admin@eduflow.dev') {
    return {
      access: 'mock_jwt_access_admin_token',
      refresh: 'mock_jwt_refresh_admin_token',
      user: mockAdminUser,
    };
  }

  // Any other username or student defaults to student
  return {
    access: 'mock_jwt_access_student_token',
    refresh: 'mock_jwt_refresh_student_token',
    user: {
      ...mockStudentUser,
      username: credentials.username || 'student',
      email: `${credentials.username || 'student'}@eduflow.dev`,
    },
  };
}

export async function logout(): Promise<void> {
  if (HAS_API) {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  }
  await sleep(200);
}

export async function refreshToken(refresh: string): Promise<RefreshResponse> {
  if (HAS_API) {
    const { data } = await apiClient.post<RefreshResponse>(ENDPOINTS.AUTH.REFRESH, { refresh });
    return data;
  }
  await sleep(300);
  return { access: 'mock_refreshed_access_token' };
}

export async function forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
  if (HAS_API) {
    await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);
    return;
  }
  await sleep(500);
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<void> {
  if (HAS_API) {
    await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, payload);
    return;
  }
  await sleep(600);
}

export async function getMe(): Promise<User> {
  if (HAS_API) {
    const { data } = await apiClient.get<User>(ENDPOINTS.AUTH.ME);
    return data;
  }
  await sleep(300);
  return mockAdminUser;
}

export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  if (HAS_API) {
    await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, payload);
    return;
  }
  await sleep(500);
}

export const authService = {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
};
