'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/shared/sidebar';
import { TopBar } from '@/components/shared/top-bar';
import { AdminSidebarNav } from '@/components/admin/sidebar-nav';
import { StudentSidebarNav } from '@/components/student/sidebar-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
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
    }
  }, [user, isAuthenticated, router, isMounted]);

  if (!isMounted || !user) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarItems = user?.role === 'admin' ? AdminSidebarNav : StudentSidebarNav;

  return (
    <div className="min-h-screen bg-[#0B0D12] flex">
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

      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onCollapse={(v) => setSidebarCollapsed(v)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
