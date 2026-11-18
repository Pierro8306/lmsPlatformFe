import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderGit2,
  FileQuestion,
  Code2,
  Megaphone,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
}

export const AdminSidebarNav: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Users & Roles',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Courses & Lessons',
    href: '/admin/courses',
    icon: BookOpen,
  },
  {
    title: 'Coding Problems',
    href: '/admin/problems',
    icon: Code2,
    badge: 'OJ',
  },
  {
    title: 'Project Assignments',
    href: '/admin/projects',
    icon: FolderGit2,
  },
  {
    title: 'Quizzes & AI Exams',
    href: '/admin/quizzes',
    icon: FileQuestion,
  },
  {
    title: 'Communication',
    href: '/admin/communication',
    icon: Megaphone,
  },
];
