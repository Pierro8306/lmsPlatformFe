'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/shared/sidebar';
import { TopBar } from '@/components/shared/top-bar';
import { AdminSidebarNav } from '@/components/admin/sidebar-nav';
import { AnimatePresence, motion } from 'framer-motion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;
    if (!isAuthenticated || !user) {
      router.replace('/login');
    } else if (user.role !== 'admin') {
      router.replace('/student/dashboard');
    }
  }, [user, isAuthenticated, router, isMounted]);

  if (!isMounted || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-muted">Loading administrative console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-text-primary flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <Sidebar
        items={AdminSidebarNav}
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onCollapse={(v) => setSidebarCollapsed(v)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
