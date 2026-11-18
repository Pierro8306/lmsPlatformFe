import type { UserRole } from './auth'

export interface UserProfile {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  group: string | null
  avatar: string | null
  bio: string | null
  isActive: boolean
  lastLogin: string | null
  enrolledCourses: number
  completedCourses: number
  createdAt: string
  updatedAt: string
}

export interface UserGroup {
  id: number
  name: string
  description: string | null
  memberCount: number
  createdAt: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  role: UserRole
  group: string | null
  firstName: string
  lastName: string
}

export interface UpdateUserRequest {
  email?: string
  firstName?: string
  lastName?: string
  bio?: string
  group?: string | null
  isActive?: boolean
  avatar?: string | null
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  old_password?: string;
  new_password?: string;
  new_password_confirm?: string;
}
