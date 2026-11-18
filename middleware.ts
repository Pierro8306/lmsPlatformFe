import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ACCESS_TOKEN_KEY = 'eduflow_access';
const USER_ROLE_KEY = 'eduflow_role';


function decodeJwtRole(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(base64);
    const parsed = JSON.parse(jsonStr);
    return parsed.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const roleCookie = request.cookies.get(USER_ROLE_KEY)?.value;
  const decodedRole = accessToken ? decodeJwtRole(accessToken) : null;
  const role = roleCookie || decodedRole;

  const isAuthenticated = !!accessToken;

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isAdminRoute = pathname.startsWith('/admin');
  const isStudentRoute = pathname.startsWith('/student');
  const isDashboardRoute =
    pathname.startsWith('/profile') || pathname.startsWith('/change-password');

  // 1. If trying to visit auth routes while logged in, redirect to respective dashboard
  if (isAuthRoute && isAuthenticated) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  // 2. If trying to access protected routes without authentication, redirect to login
  if (!isAuthenticated && (isAdminRoute || isStudentRoute || isDashboardRoute)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role enforcement: student trying to access admin routes
  if (isAdminRoute && role === 'student') {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/profile',
    '/change-password',
    '/login',
    '/forgot-password',
    '/reset-password',
  ],
};
