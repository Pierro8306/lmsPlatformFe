'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bell,
  Pin,
  CheckCheck,
  Search,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { announcementService } from '@/services/announcement.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import type { Announcement } from '@/types/announcement';

export default function StudentAnnouncementsPage() {
  const [readIds, setReadIds] = React.useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: annData, isLoading } = useQuery({
    queryKey: ['student', 'announcements'],
    queryFn: () => announcementService.getAnnouncements(),
  });

  const announcements = annData?.results || [];

  const handleMarkAllRead = () => {
    const all = new Set(announcements.map((a) => a.id));
    setReadIds(all);
    toast.success('All announcements marked as read');
  };

  const markSingleRead = (id: string | number) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.author || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = announcements.filter((a) => !readIds.has(a.id)).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Notification Center"
        subtitle="Official platform announcements, syllabus modifications, and scheduled maintenance bulletins"
        gradientTitle
      >
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs border-accent-indigo/40 hover:bg-accent-indigo/10"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1 text-accent-cyan" />
            <span>Mark all as read ({unreadCount})</span>
          </Button>
        )}
      </PageHeader>

      {/* Search Toolbar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search announcements..."
          className="pl-9 bg-background-elevated/80 border-border-subtle h-9 text-xs"
        />
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((ann) => {
          const isUnread = !readIds.has(ann.id);

          return (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => markSingleRead(ann.id)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                ann.isPinned
                  ? 'border-accent-indigo/50 bg-[#151923] shadow-lg shadow-accent-indigo/5'
                  : 'border-border-DEFAULT bg-[#151923] hover:border-border-subtle'
              }`}
            >
              {/* Unread indicator glow bar on left */}
              {isUnread && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent-indigo to-accent-cyan" />
              )}

              <div className="space-y-3 pl-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.isPinned && (
                      <Badge variant="indigo" className="text-[10px] py-0 flex items-center gap-1">
                        <Pin className="w-3 h-3 rotate-45" />
                        Pinned Notice
                      </Badge>
                    )}

                    <Badge variant="default" className="text-[10px] py-0 capitalize">
                      {ann.target === 'all' ? 'All Cohorts' : `Target: ${ann.target}`}
                    </Badge>

                    {isUnread && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-accent-cyan">
                        <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                        New
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-text-muted">
                    {format(new Date(ann.createdAt || Date.now()), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    {ann.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line mt-2">
                    {ann.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs text-text-muted">
                  <span>
                    Issued by <strong>{ann.author}</strong>
                  </span>

                  {!isUnread && (
                    <span className="text-text-muted flex items-center gap-1 text-[11px]">
                      <CheckCheck className="w-3.5 h-3.5 text-text-muted" /> Read
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You are completely up to date with all platform announcements."
          />
        )}
      </div>
    </div>
  );
}
