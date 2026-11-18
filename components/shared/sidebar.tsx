'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { NavItem } from '@/components/admin/sidebar-nav';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  items: NavItem[];
  isOpen: boolean;
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onClose: () => void;
}

export function Sidebar({
  items,
  isOpen,
  isCollapsed,
  onCollapse,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border-DEFAULT bg-[#0B0D12]/95 backdrop-blur-xl transition-all duration-300 shadow-2xl',
        isCollapsed ? 'w-20' : 'w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border-subtle">
        <Link
          href={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
          className="flex items-center gap-3 overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-indigo via-accent-violet to-accent-cyan flex items-center justify-center shadow-lg shadow-accent-indigo/25 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base tracking-tight text-text-primary">
                EduFlow <span className="text-accent-indigo">LMS</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">
                {user?.role === 'admin' ? 'Administration' : 'Student Portal'}
              </span>
            </div>
          )}
        </Link>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => onCollapse(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Role Pill Banner */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-border-subtle/50 bg-background-elevated/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Active Role</span>
            <Badge
              variant={user?.role === 'admin' ? 'indigo' : 'cyan'}
              className="capitalize text-[11px] py-0.5"
            >
              {user?.role === 'admin' ? (
                <ShieldAlert className="w-3 h-3 mr-1" />
              ) : (
                <GraduationCap className="w-3 h-3 mr-1" />
              )}
              {user?.role || 'Guest'}
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/dashboard' &&
              item.href !== '/student/dashboard' &&
              pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-accent-indigo/20 to-accent-violet/10 text-white border border-accent-indigo/40 shadow-sm shadow-accent-indigo/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated/70'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive
                    ? 'text-accent-indigo'
                    : 'text-text-muted group-hover:text-text-primary'
                )}
              />

              {!isCollapsed && (
                <span className="truncate flex-1">{item.title}</span>
              )}

              {item.badge && !isCollapsed && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30">
                  {item.badge}
                </span>
              )}

              {/* Active glow indicator on left edge */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-accent-indigo to-accent-violet rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile summary */}
      <div className="p-3 border-t border-border-subtle bg-background-elevated/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-indigo to-accent-violet flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Guest User'}
              </p>
              <p className="text-[11px] text-text-muted truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
