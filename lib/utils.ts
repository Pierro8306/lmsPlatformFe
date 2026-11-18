import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    // Submission statuses
    pending: 'text-status-warning bg-status-warning/10 border-status-warning/20',
    submitted: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
    graded: 'text-status-success bg-status-success/10 border-status-success/20',
    late: 'text-status-danger bg-status-danger/10 border-status-danger/20',
    resubmit: 'text-accent-violet bg-accent-violet/10 border-accent-violet/20',
    // Event types
    deadline: 'text-status-danger bg-status-danger/10 border-status-danger/20',
    live_session: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
    exam: 'text-status-warning bg-status-warning/10 border-status-warning/20',
    holiday: 'text-status-success bg-status-success/10 border-status-success/20',
    other: 'text-text-muted bg-text-muted/10 border-text-muted/20',
    // General
    active: 'text-status-success bg-status-success/10 border-status-success/20',
    inactive: 'text-text-muted bg-text-muted/10 border-text-muted/20',
    published: 'text-status-success bg-status-success/10 border-status-success/20',
    draft: 'text-text-muted bg-text-muted/10 border-text-muted/20',
  }
  return colorMap[status] ?? 'text-text-muted bg-text-muted/10 border-text-muted/20'
}

export function isValidGitHubUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      (parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com') &&
      parsed.pathname.split('/').filter(Boolean).length >= 2
    )
  } catch {
    return false
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
