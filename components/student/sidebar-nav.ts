import {
  LayoutDashboard,
  GraduationCap,
  Code2,
  FolderGit2,
  FileQuestion,
  Bell,
  Calendar,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
}

export const StudentSidebarNav: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/student/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Courses',
    href: '/student/courses',
    icon: GraduationCap,
  },
  {
    title: 'Coding Arena',
    href: '/student/problems',
    icon: Code2,
    badge: 'Code',
  },
  {
    title: 'Projects',
    href: '/student/projects',
    icon: FolderGit2,
  },
  {
    title: 'Quizzes',
    href: '/student/quizzes',
    icon: FileQuestion,
  },
  {
    title: 'Announcements',
    href: '/student/announcements',
    icon: Bell,
  },
  {
    title: 'Events',
    href: '/student/events',
    icon: Calendar,
  },
];
