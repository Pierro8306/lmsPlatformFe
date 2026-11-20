import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getRefreshToken, setTokens } from '@/lib/auth';
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
  UserRole,
} from '@/types/auth';
import type { ChangePasswordRequest } from '@/types/user';

function normalizeRole(roleStr?: string | null): UserRole {
  if (!roleStr) return 'student';
  const lower = roleStr.toLowerCase();
  return lower.includes('admin') ? 'admin' : 'student';
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<{
    role: string;
    token: string;
    refreshToken: string;
  }>(ENDPOINTS.AUTH.LOGIN, {
    username: credentials.username,
    password: credentials.password,
  });

  const access = data.token;
  const refresh = data.refreshToken;
  const role = normalizeRole(data.role);

  // Set tokens in cookies & localStorage so subsequent requests work immediately
  setTokens(access, refresh, role);

  // Fetch full profile info from /api/common/profile
  let user: User;
  try {
    user = await getMe();
  } catch {
    user = {
      id: credentials.username,
      username: credentials.username,
      email: `${credentials.username}@eduflow.dev`,
      role,
      group: null,
      avatar: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    access,
    refresh,
    user,
  };
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {
      refreshToken: refresh || undefined,
    });
  } catch {
    // If server logout fails (e.g. network), ignore so client can still clear session
  }
}

export async function refreshToken(refresh: string): Promise<RefreshResponse> {
  const { data } = await apiClient.post<{
    role: string;
    token: string;
    refreshToken: string;
  }>(ENDPOINTS.AUTH.REFRESH, {
    refreshToken: refresh,
  });

  if (data?.token) {
    setTokens(data.token, data.refreshToken || refresh, normalizeRole(data.role));
  }

  return { access: data.token };
}

export async function forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
  await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    email: payload.email,
  });
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<void> {
  await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
    token: payload.token,
    newPassword: payload.newPassword || payload.password,
  });
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<{
    id: string;
    role: string;
    userGroup: string | null;
    username: string;
    email: string;
  }>(ENDPOINTS.AUTH.ME);

  const role = normalizeRole(data.role);

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.username,
    lastName: '',
    role,
    group: data.userGroup || null,
    avatar: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  const oldPassword = payload.oldPassword || payload.currentPassword || payload.old_password || '';
  const newPassword = payload.newPassword || payload.new_password || '';

  const { data } = await apiClient.post<{
    role: string;
    token: string;
    refreshToken: string;
  }>(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    oldPassword,
    newPassword,
  });

  if (data?.token) {
    setTokens(data.token, data.refreshToken, normalizeRole(data.role));
  }
}

export async function updateProfile(payload: {
  username: string;
  email: string;
  currentPassword?: string;
}): Promise<User> {
  const { data } = await apiClient.put<{
    id: string;
    role: string;
    userGroup: string | null;
    username: string;
    email: string;
  }>(ENDPOINTS.AUTH.ME, {
    username: payload.username.trim(),
    email: payload.email.trim(),
    currentPassword: payload.currentPassword,
  });

  const role = normalizeRole(data.role);

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.username,
    lastName: '',
    role,
    group: data.userGroup || null,
    avatar: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const authService = {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
};
