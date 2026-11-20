'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Bell,
  ArrowRight,
  Layers,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { studentService } from '@/services/student.service';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#151923] rounded-xl p-5 animate-pulse ${className}`}>
      <div className="h-4 bg-[#2A3142] rounded w-1/2 mb-3" />
      <div className="h-8 bg-[#2A3142] rounded w-1/3 mb-2" />
      <div className="h-3 bg-[#2A3142] rounded w-2/3" />
    </div>
  );
}

export default function StudentDashboardPage() {
  const { user } = useAuthStore();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: () => studentService.getDashboard(),
  });

  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ['student', 'announcements', 'recent'],
    queryFn: () => studentService.getAnnouncements({ limit: 3 }),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    {
      label: 'In Progress',
      value: dashboard?.coursesInProgress ?? 0,
      icon: TrendingUp,
      color: 'text-[#6366F1]',
      bg: 'bg-[#6366F1]/10',
    },
    {
      label: 'Completed',
      value: dashboard?.coursesCompleted ?? 0,
      icon: CheckCircle2,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/10',
    },
    {
      label: 'Total Enrolled',
      value: dashboard?.totalCourses ?? 0,
      icon: BookOpen,
      color: 'text-[#22D3EE]',
      bg: 'bg-[#22D3EE]/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-32 bg-[#151923] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SkeletonCard className="h-40" />
            <SkeletonCard className="h-48" />
          </div>
          <div className="space-y-4">
            <SkeletonCard className="h-56" />
            <SkeletonCard className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Hero */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1F2B] via-[#1e1b4b] to-[#0B0D12] border border-[#2A3142] p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/20 via-transparent to-[#22D3EE]/10 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[#9AA3B5] text-sm font-medium mb-1">{greeting()},</p>
          <h1 className="text-3xl font-bold text-[#E6E9F0] mb-2">
            {user?.firstName ?? user?.username ?? 'Student'}! 👋
          </h1>
          <p className="text-[#9AA3B5] max-w-lg">
            You have{' '}
            <span className="text-[#6366F1] font-semibold">
              {dashboard?.upcomingDeadlines?.length ?? 0} upcoming deadline
              {dashboard?.upcomingDeadlines?.length !== 1 ? 's' : ''}
            </span>{' '}
            and{' '}
            <span className="text-[#22D3EE] font-semibold">
              {dashboard?.unreadAnnouncements ?? 0} unread announcement
              {dashboard?.unreadAnnouncements !== 1 ? 's' : ''}
            </span>
            . Keep up the great work!
          </p>
        </div>
        <div className="absolute top-4 right-6 opacity-10">
          <BookOpen className="w-32 h-32 text-[#6366F1]" />
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-[#151923] rounded-xl border border-[#2A3142] p-5 flex items-center gap-4"
          >
            <div className={`${s.bg} rounded-lg p-3`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-[#9AA3B5] text-sm">{s.label}</p>
              <p className="text-2xl font-bold text-[#E6E9F0]">{s.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Lesson Card */}
          {dashboard?.nextLesson && (
            <motion.div
              variants={item}
              className="bg-[#151923] rounded-xl border border-[#2A3142] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#E6E9F0] font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#6366F1]" />
                  Continue Where You Left Off
                </h2>
                <Link
                  href={`/student/courses/${dashboard.nextLesson.courseId}/lessons/${dashboard.nextLesson.lessonId}`}
                  className="text-[#6366F1] text-sm hover:text-[#818cf8] transition-colors flex items-center gap-1"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    background: `hsl(${(dashboard.nextLesson.courseId?.charCodeAt(0) ?? 60) * 15}, 70%, 45%)`,
                  }}
                >
                  {dashboard.nextLesson.courseTitle?.charAt(0) ?? 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#9AA3B5] text-xs mb-1">{dashboard.nextLesson.courseTitle}</p>
                  <h3 className="text-[#E6E9F0] font-medium truncate">{dashboard.nextLesson.lessonTitle}</h3>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-[#9AA3B5] mb-1">
                      <span>Progress</span>
                      <span>{dashboard.nextLesson.progress ?? 0}%</span>
                    </div>
                    <div className="h-1.5 bg-[#2A3142] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#6366F1] to-[#22D3EE] rounded-full transition-all"
                        style={{ width: `${dashboard.nextLesson.progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Upcoming Deadlines */}
          <motion.div
            variants={item}
            className="bg-[#151923] rounded-xl border border-[#2A3142] p-6"
          >
            <h2 className="text-[#E6E9F0] font-semibold flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-[#F59E0B]" />
              Upcoming Deadlines
            </h2>
            {!dashboard?.upcomingDeadlines?.length ? (
              <p className="text-[#9AA3B5] text-sm text-center py-4">
                No upcoming deadlines. Great job staying on track!
              </p>
            ) : (
              <div className="space-y-3">
                {dashboard.upcomingDeadlines.map((d: any) => {
                  const deadline = new Date(d.dueDate);
                  const overdue = isPast(deadline);
                  return (
                    <div
                      key={d.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#1A1F2B] border border-[#2A3142]"
                    >
                      <div className="min-w-0">
                        <p className="text-[#E6E9F0] text-sm font-medium truncate">{d.title}</p>
                        <p className="text-[#9AA3B5] text-xs mt-0.5">{d.type}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                          overdue
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        }`}
                      >
                        {overdue ? 'Overdue' : formatDistanceToNow(deadline, { addSuffix: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Access */}
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Continue Learning', href: '/student/courses', icon: BookOpen, color: 'from-[#6366F1] to-[#4f46e5]' },
              { label: 'My Projects', href: '/student/projects', icon: Layers, color: 'from-[#8B5CF6] to-[#7c3aed]' },
              { label: 'Take a Quiz', href: '/student/quizzes', icon: ClipboardList, color: 'from-[#22D3EE] to-[#0891b2]' },
            ].map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className={`bg-gradient-to-br ${card.color} rounded-xl p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform`}
              >
                <card.icon className="w-7 h-7 text-white/80" />
                <span className="text-white font-semibold">{card.label}</span>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Announcements */}
          <motion.div
            variants={item}
            className="bg-[#151923] rounded-xl border border-[#2A3142] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#E6E9F0] font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#22D3EE]" />
                Announcements
              </h2>
              <Link
                href="/student/announcements"
                className="text-[#6366F1] text-xs hover:text-[#818cf8] transition-colors"
              >
                View all
              </Link>
            </div>
            {announcementsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-3 bg-[#2A3142] rounded w-3/4 mb-1" />
                    <div className="h-2 bg-[#2A3142] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : !announcements?.length ? (
              <p className="text-[#9AA3B5] text-sm text-center py-4">No announcements yet.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1A1F2B] transition-colors"
                  >
                    {!a.isRead && (
                      <div className="w-2 h-2 rounded-full bg-[#6366F1] mt-1.5 flex-shrink-0" />
                    )}
                    <div className={!a.isRead ? '' : 'ml-5'}>
                      <p className={`text-sm leading-snug ${!a.isRead ? 'text-[#E6E9F0] font-medium' : 'text-[#9AA3B5]'}`}>
                        {a.title}
                      </p>
                      <p className="text-[#6B7385] text-xs mt-0.5">
                        {format(new Date(a.createdAt || Date.now()), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
