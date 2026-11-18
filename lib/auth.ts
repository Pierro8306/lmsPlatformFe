import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'eduflow_access';
const REFRESH_TOKEN_KEY = 'eduflow_refresh';
const USER_ROLE_KEY = 'eduflow_role';

// Cookie options
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  expires: 7, // days
};

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? Cookies.get(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? Cookies.get(REFRESH_TOKEN_KEY) ?? null;
}

export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ROLE_KEY) ?? Cookies.get(USER_ROLE_KEY) ?? null;
}

export function setTokens(access: string, refresh: string, role?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  Cookies.set(ACCESS_TOKEN_KEY, access, COOKIE_OPTIONS);
  Cookies.set(REFRESH_TOKEN_KEY, refresh, COOKIE_OPTIONS);

  if (role) {
    localStorage.setItem(USER_ROLE_KEY, role);
    Cookies.set(USER_ROLE_KEY, role, COOKIE_OPTIONS);
  }
}

export function setUserRole(role: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_ROLE_KEY, role);
  Cookies.set(USER_ROLE_KEY, role, COOKIE_OPTIONS);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
  Cookies.remove(USER_ROLE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Decode a JWT payload without verifying the signature.
 * Safe to use on the client and in Next.js middleware.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded =
      typeof atob !== 'undefined'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return Date.now() >= payload.exp * 1000;
}

export function getTokenRole(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return (payload.role as string) ?? null;
}
