'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { studentService } from '@/services/student.service';
import type { StudentCourse } from '@/types';

type FilterTab = 'all' | 'in_progress' | 'completed';

const COURSE_COLORS = [
  'from-[#6366F1] to-[#4f46e5]',
  'from-[#8B5CF6] to-[#7c3aed]',
  'from-[#22D3EE] to-[#0891b2]',
  'from-[#EC4899] to-[#db2777]',
  'from-[#F59E0B] to-[#d97706]',
  'from-[#10B981] to-[#059669]',
];

function CourseCardSkeleton() {
  return (
    <div className="bg-[#151923] rounded-xl border border-[#2A3142] overflow-hidden animate-pulse">
      <div className="h-32 bg-[#2A3142]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#2A3142] rounded w-3/4" />
        <div className="h-3 bg-[#2A3142] rounded w-1/2" />
        <div className="h-2 bg-[#2A3142] rounded-full" />
        <div className="h-9 bg-[#2A3142] rounded-lg" />
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: StudentCourse }) {
  const colorClass = COURSE_COLORS[(String(course.id).charCodeAt(0) ?? 0) % COURSE_COLORS.length];
  const isCompleted = course.progress >= 100;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
      transition={{ duration: 0.2 }}
      className="bg-[#151923] rounded-xl border border-[#2A3142] overflow-hidden flex flex-col"
    >
      {/* Thumbnail */}
      <div className={`h-32 bg-gradient-to-br ${colorClass} flex items-center justify-center relative`}>
        <BookOpen className="w-12 h-12 text-white/30" />
        <div className="absolute top-3 right-3">
          <span className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
            {course.lessonCount ?? 0} lessons
          </span>
        </div>
        {isCompleted && (
          <div className="absolute top-3 left-3">
            <span className="bg-green-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              Completed
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3
          className="text-[#E6E9F0] font-semibold text-sm leading-snug mb-1 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {course.title}
        </h3>
        <p className="text-[#9AA3B5] text-xs mb-3">{course.instructor}</p>

        {/* Progress bar */}
        <div className="mt-auto">
          <div className="flex justify-between text-xs text-[#9AA3B5] mb-1">
            <span>Progress</span>
            <span>{Math.round(course.progress ?? 0)}%</span>
          </div>
          <div className="h-1.5 bg-[#2A3142] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-[#6366F1] to-[#22D3EE] rounded-full transition-all duration-500"
              style={{ width: `${course.progress ?? 0}%` }}
            />
          </div>

          <Link
            href={`/student/courses/${course.id}`}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4f46e5] text-white text-sm font-medium transition-colors"
          >
            {isCompleted ? 'Review' : course.progress > 0 ? 'Continue' : 'Start'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['student', 'courses', activeTab, debouncedSearch],
    queryFn: () =>
      studentService.getMyCourses({ filter: activeTab, search: debouncedSearch }),
  });

  const handleTabChange = useCallback((tab: FilterTab) => setActiveTab(tab), []);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#E6E9F0] mb-1">My Courses</h1>
        <p className="text-[#9AA3B5] text-sm">Your enrolled courses and progress</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#151923] rounded-lg border border-[#2A3142]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === t.key
                  ? 'bg-[#6366F1] text-white'
                  : 'text-[#9AA3B5] hover:text-[#E6E9F0]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA3B5]" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#151923] border border-[#2A3142] rounded-lg text-[#E6E9F0] text-sm placeholder:text-[#6B7385] focus:outline-none focus:border-[#6366F1] transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-[#EF4444]">
          <p className="text-lg font-medium mb-2">Failed to load courses</p>
          <p className="text-sm text-[#9AA3B5]">Please try refreshing the page.</p>
        </div>
      ) : !courses?.length ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <BookOpen className="w-14 h-14 text-[#2A3142] mx-auto mb-4" />
          <h3 className="text-[#E6E9F0] font-semibold text-lg mb-2">No courses found</h3>
          <p className="text-[#9AA3B5] text-sm">
            {debouncedSearch
              ? `No courses match "${debouncedSearch}"`
              : activeTab === 'all'
              ? 'You have not enrolled in any courses yet.'
              : `No ${activeTab.replace('_', ' ')} courses.`}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
