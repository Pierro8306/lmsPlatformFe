'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  ClipboardList,
  FileCheck,
  Plus,
  UserPlus,
  Megaphone,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/axios';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  activeQuizzes: number;
  totalSubmissions: number;
  usersTrend: number;
  coursesTrend: number;
  quizzesTrend: number;
  submissionsTrend: number;
}

interface RecentActivity {
  id: number;
  type: 'announcement' | 'course' | 'quiz' | 'user';
  title: string;
  description: string;
  createdAt: string;
}

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

async function fetchDashboardStats(): Promise<DashboardStats> {
  if (HAS_API) {
    const { data } = await apiClient.get('/admin/dashboard/stats/');
    return data;
  }
  return {
    totalUsers: 142,
    totalCourses: 12,
    activeQuizzes: 8,
    totalSubmissions: 94,
    usersTrend: 14.5,
    coursesTrend: 8.2,
    quizzesTrend: 22.0,
    submissionsTrend: 18.7,
  };
}

async function fetchRecentActivity(): Promise<RecentActivity[]> {
  if (HAS_API) {
    const { data } = await apiClient.get('/admin/dashboard/activity/');
    return data;
  }
  return [
    {
      id: 1,
      type: 'quiz',
      title: 'Alex Rivers completed React Architecture Quiz',
      description: 'Scored 100% on Attempt #2 (Time: 7m 04s)',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: 2,
      type: 'user',
      title: 'Jordan Vance submitted Project: SaaS Portfolio',
      description: 'GitHub repository linked with live Vercel deployment preview',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 3,
      type: 'announcement',
      title: 'Midterm Examination Schedule Published',
      description: 'Announcement broadcasted to all students across cohorts',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 4,
      type: 'course',
      title: 'New Lesson added to Full-Stack Web Development',
      description: 'Production Deployment & Edge Caching added to curriculum',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ];
}

const statCards = [
  {
    key: 'totalUsers' as const,
    trendKey: 'usersTrend' as const,
    label: 'Total Users',
    icon: Users,
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
    href: '/admin/users',
  },
  {
    key: 'totalCourses' as const,
    trendKey: 'coursesTrend' as const,
    label: 'Total Courses',
    icon: BookOpen,
    color: 'from-indigo-500/20 to-indigo-600/10',
    iconColor: 'text-accent-indigo',
    href: '/admin/courses',
  },
  {
    key: 'activeQuizzes' as const,
    trendKey: 'quizzesTrend' as const,
    label: 'Active Quizzes',
    icon: ClipboardList,
    color: 'from-violet-500/20 to-violet-600/10',
    iconColor: 'text-violet-400',
    href: '/admin/quizzes',
  },
  {
    key: 'totalSubmissions' as const,
    trendKey: 'submissionsTrend' as const,
    label: 'Submissions',
    icon: FileCheck,
    color: 'from-cyan-500/20 to-cyan-600/10',
    iconColor: 'text-cyan-400',
    href: '/admin/projects',
  },
];

const quickActions = [
  { label: 'Create Course', icon: BookOpen, href: '/admin/courses', color: 'bg-accent-indigo/10 text-accent-indigo hover:bg-accent-indigo/20' },
  { label: 'Add User', icon: UserPlus, href: '/admin/users', color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' },
  { label: 'Create Quiz', icon: ClipboardList, href: '/admin/quizzes', color: 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20' },
  { label: 'Announcement', icon: Megaphone, href: '/admin/announcements', color: 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' },
];

function StatCardSkeleton() {
  return (
    <div className="bg-background-card border border-border-DEFAULT rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-background-elevated rounded" />
        <div className="h-10 w-10 bg-background-elevated rounded-xl" />
      </div>
      <div className="h-8 w-20 bg-background-elevated rounded mb-2" />
      <div className="h-3 w-16 bg-background-elevated rounded" />
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="h-8 w-8 bg-background-elevated rounded-full shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-3/4 bg-background-elevated rounded" />
            <div className="h-3 w-1/2 bg-background-elevated rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    // Provide fallback data for development
    placeholderData: {
      totalUsers: 0,
      totalCourses: 0,
      activeQuizzes: 0,
      totalSubmissions: 0,
      usersTrend: 0,
      coursesTrend: 0,
      quizzesTrend: 0,
      submissionsTrend: 0,
    },
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'activity'],
    queryFn: fetchRecentActivity,
    placeholderData: [],
  });

  const displayName = user?.username ?? 'Admin';

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Welcome back, <span className="text-accent-indigo">{displayName}</span> 👋
        </h1>
        <p className="text-text-secondary mt-1">
          Here&apos;s what&apos;s happening in EduFlow today.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          : statsError
          ? (
            <div className="col-span-4 text-center text-status-danger py-8">
              Failed to load stats. Please try refreshing.
            </div>
          )
          : statCards.map((card, index) => {
              const Icon = card.icon;
              const value = stats?.[card.key] ?? 0;
              const trend = stats?.[card.trendKey] ?? 0;
              const isPositive = trend >= 0;

              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Link href={card.href}>
                    <div className="bg-background-card border border-border-DEFAULT rounded-xl p-6 hover:border-accent-indigo/50 transition-all duration-200 group cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-text-secondary">{card.label}</span>
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${card.iconColor}`} />
                        </div>
                      </div>
                      <div className="text-3xl font-bold font-heading text-text-primary mb-1">
                        {value.toLocaleString()}
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-status-success' : 'text-status-danger'}`}>
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(trend)}% from last month
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 bg-background-card border border-border-DEFAULT rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-text-primary">Recent Activity</h2>
            <Link href="/admin/announcements">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {activityLoading ? (
            <ActivitySkeleton />
          ) : !activity || activity.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">
              <Megaphone className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-accent-indigo/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="h-4 w-4 text-accent-indigo" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-background-card border border-border-DEFAULT rounded-xl p-6"
        >
          <h2 className="font-heading font-semibold text-text-primary mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <div className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 cursor-pointer ${action.color}`}>
                    <div className="h-8 w-8 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-5 pt-5 border-t border-border-DEFAULT">
            <p className="text-xs text-text-secondary mb-3">Jump to</p>
            <div className="space-y-1">
              {[
                { label: 'User Management', href: '/admin/users' },
                { label: 'Course Catalog', href: '/admin/courses' },
                { label: 'Quiz Gradebook', href: '/admin/quizzes' },
                { label: 'Events', href: '/admin/events' },
              ].map((link) => (
                <Link key={link.label} href={link.href}>
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-background-elevated transition-colors group">
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      {link.label}
                    </span>
                    <ArrowRight className="h-3 w-3 text-text-muted group-hover:text-accent-indigo transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
