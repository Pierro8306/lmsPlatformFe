'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  User,
  KeyRound,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [hasUnread, setHasUnread] = React.useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    router.push('/login');
  };

  const handleToggleDemoRole = () => {
    if (!user) return;
    const nextRole = user.role === 'admin' ? 'student' : 'admin';
    setUser({
      ...user,
      role: nextRole,
    });
    toast.info(`Switched role to ${nextRole.toUpperCase()}`);
    if (nextRole === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border-DEFAULT bg-[#0B0D12]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 p-0 text-text-secondary hover:text-text-primary"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
          <span className="inline-block w-2 h-2 rounded-full bg-status-success animate-pulse" />
          <span>System Online</span>
          <span className="text-border-DEFAULT">•</span>
          <span className="text-accent-indigo">v2.4.0 Dark Edition</span>
        </div>
      </div>

      {/* Right side: Notifications, Role Switcher & User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Switcher Pill */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleDemoRole}
          className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 text-xs border-border-subtle hover:border-accent-indigo bg-background-card/50"
          title="Demo feature: toggle between admin and student mode"
        >
          <RefreshCw className="w-3 h-3 text-accent-indigo" />
          <span>Switch to {user?.role === 'admin' ? 'Student' : 'Admin'}</span>
        </Button>

        {/* Notification Bell */}
        <Link
          href={user?.role === 'admin' ? '/admin/communication' : '/student/announcements'}
          className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background-elevated transition-colors"
          onClick={() => setHasUnread(false)}
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-indigo shadow-sm shadow-accent-indigo animate-pulse" />
          )}
        </Link>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-background-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-accent-indigo/40">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-indigo to-accent-violet flex items-center justify-center font-bold text-white text-xs shadow-md">
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-text-primary leading-tight">
                  {user?.firstName || user?.username || 'User'}
                </span>
                <span className="text-[10px] text-text-muted capitalize">
                  {user?.role || 'Guest'}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-1.5">
            <DropdownMenuLabel className="px-2 py-1.5">
              <p className="text-xs font-semibold text-text-primary truncate">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Account'}
              </p>
              <p className="text-[11px] text-text-muted font-normal truncate">
                {user?.email || 'user@example.com'}
              </p>
              <div className="mt-1.5">
                <Badge variant={user?.role === 'admin' ? 'indigo' : 'cyan'} className="text-[10px] py-0 px-1.5">
                  {user?.role?.toUpperCase() || 'STUDENT'}
                </Badge>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4 text-text-muted" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/change-password" className="flex items-center gap-2 cursor-pointer">
                <KeyRound className="w-4 h-4 text-text-muted" />
                <span>Change Password</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleToggleDemoRole} className="cursor-pointer md:hidden">
              <RefreshCw className="w-4 h-4 text-accent-indigo" />
              <span>Switch to {user?.role === 'admin' ? 'Student' : 'Admin'}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-status-danger focus:text-status-danger focus:bg-status-danger/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
