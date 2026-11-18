'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Check,
  Plus,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { eventService } from '@/services/event.service';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import type { Event, EventParticipant } from '@/types/announcement';

export default function StudentEventsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Optimistic tracking of user joined events: Map of eventId -> boolean
  const [joinedMap, setJoinedMap] = React.useState<Record<number, boolean>>({
    1: true, // sample: student initially joined event 1
    2: true,
  });

  // Participant counts map: eventId -> count
  const [countsMap, setCountsMap] = React.useState<Record<number, number>>({
    1: 18,
    2: 12,
    3: 7,
  });

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['student', 'events'],
    queryFn: () => eventService.getEvents(),
  });

  const events = eventData?.results || [];

  // Toggle Join/Leave mutation with OPTIMISTIC UI update
  const toggleMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const isCurrentlyJoined = !!joinedMap[eventId];
      return eventService.toggleEventAttendance(
        eventId,
        user?.id || 2,
        user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Alex Rivers',
        user?.email || 'student@eduflow.dev'
      );
    },
    onMutate: async (eventId: number) => {
      // Optimistic update
      const wasJoined = !!joinedMap[eventId];
      const nextJoined = !wasJoined;

      setJoinedMap((prev) => ({
        ...prev,
        [eventId]: nextJoined,
      }));

      setCountsMap((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] || 0) + (nextJoined ? 1 : -1),
      }));

      if (nextJoined) {
        toast.success('RSVP confirmed! Event added to your learning schedule.');
      } else {
        toast.info('You have left this event.');
      }
    },
    onError: (err, eventId) => {
      // Rollback on error
      setJoinedMap((prev) => ({
        ...prev,
        [eventId]: !prev[eventId],
      }));
      toast.error('Failed to update RSVP. Please try again.');
    },
  });

  const handleToggle = (eventId: number) => {
    toggleMutation.mutate(eventId);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Live Workshops & Campus Events"
        subtitle="RSVP for interactive webinars, review milestones, and join virtual masterclasses"
        gradientTitle
      />

      {/* Events Feed */}
      <div className="space-y-4">
        {events.map((ev) => {
          const isJoined = !!joinedMap[ev.id];
          const participantCount = countsMap[ev.id] ?? 10;

          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
                isJoined
                  ? 'border-accent-indigo/50 bg-[#151923] shadow-lg shadow-accent-indigo/5'
                  : 'border-border-DEFAULT bg-[#151923] hover:border-border-subtle'
              }`}
            >
              <div className="space-y-3 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={
                      ev.type === 'live_session'
                        ? 'indigo'
                        : ev.type === 'deadline'
                        ? 'danger'
                        : 'cyan'
                    }
                    className="text-xs capitalize font-semibold"
                  >
                    {ev.type.replace('_', ' ')}
                  </Badge>

                  {isJoined && (
                    <Badge variant="success" className="text-xs flex items-center gap-1 font-semibold">
                      <Check className="w-3 h-3" />
                      Attending
                    </Badge>
                  )}

                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-accent-cyan" />
                    {participantCount} registered
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">
                    {ev.title}
                  </h3>
                  {ev.description && (
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-text-muted pt-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>{format(new Date(ev.startDate), 'EEEE, MMMM d, yyyy • h:mm a')}</span>
                  </div>

                  {ev.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-text-muted" />
                      <span>{ev.location}</span>
                    </div>
                  )}

                  {ev.meetingUrl && (
                    <div className="flex items-center gap-2">
                      <Video className="w-3.5 h-3.5 text-accent-indigo" />
                      <a
                        href={ev.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-indigo hover:underline flex items-center gap-1"
                      >
                        Launch Meeting <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Optimistic RSVP Action Button */}
              <div className="self-end sm:self-center shrink-0">
                <Button
                  onClick={() => handleToggle(ev.id)}
                  variant={isJoined ? 'secondary' : 'default'}
                  className={`h-10 px-5 text-xs font-semibold rounded-xl transition-all ${
                    isJoined
                      ? 'border-status-success/40 text-status-success hover:bg-status-danger/10 hover:text-status-danger hover:border-status-danger/40'
                      : 'bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110 shadow-lg shadow-accent-indigo/25'
                  }`}
                >
                  {isJoined ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      <span>Joined (Click to Leave)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1.5" />
                      <span>Join Event</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}

        {events.length === 0 && (
          <EmptyState
            icon={Calendar}
            title="No upcoming events"
            description="Live workshops and cohort sessions will be scheduled soon."
          />
        )}
      </div>
    </div>
  );
}
