export type UserRole = 'admin' | 'student';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  role: UserRole;
  group: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password?: string;
  newPassword?: string;
  passwordConfirm?: string;
}
