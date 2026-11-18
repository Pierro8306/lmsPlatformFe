'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Calendar,
  Plus,
  Pin,
  Edit2,
  Trash2,
  Users,
  Video,
  Clock,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { announcementService } from '@/services/announcement.service';
import { eventService } from '@/services/event.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import type { Announcement, Event, EventParticipant, EventType } from '@/types/announcement';
import type { AnnouncementFormValues, EventFormValues } from '@/lib/validators';

export default function AdminCommunicationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'announcements' | 'events'>('announcements');

  // Announcement Modals & Form
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = React.useState(false);
  const [editingAnnounce, setEditingAnnounce] = React.useState<Announcement | null>(null);
  const [announceToDelete, setAnnounceToDelete] = React.useState<Announcement | null>(null);

  const [annTitle, setAnnTitle] = React.useState('');
  const [annContent, setAnnContent] = React.useState('');
  const [annTarget, setAnnTarget] = React.useState<'all' | 'group' | 'course'>('all');
  const [annPinned, setAnnPinned] = React.useState(false);

  // Event Modals & Form
  const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = React.useState<Event | null>(null);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = React.useState<Event | null>(null);

  const [eventTitle, setEventTitle] = React.useState('');
  const [eventDescription, setEventDescription] = React.useState('');
  const [eventType, setEventType] = React.useState<EventType>('live_session');
  const [eventStartDate, setEventStartDate] = React.useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [eventEndDate, setEventEndDate] = React.useState(
    new Date(Date.now() + 86400000 * 2 + 7200000).toISOString().slice(0, 16)
  );
  const [eventLocation, setEventLocation] = React.useState('Virtual Classroom');
  const [eventMeetingUrl, setEventMeetingUrl] = React.useState('https://zoom.us/j/eduflow-meeting');

  // Queries
  const { data: annData } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: () => announcementService.getAnnouncements(),
  });
  const announcements = annData?.results || [];

  const { data: eventData } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: () => eventService.getEvents(),
  });
  const events = eventData?.results || [];

  const { data: participants = [], isLoading: isParticipantsLoading } = useQuery({
    queryKey: ['admin', 'event-participants', selectedEventForParticipants?.id],
    queryFn: () =>
      selectedEventForParticipants
        ? eventService.getEventParticipants(selectedEventForParticipants.id)
        : Promise.resolve([]),
    enabled: !!selectedEventForParticipants,
  });

  // Announcement Mutations
  const saveAnnounceMutation = useMutation({
    mutationFn: async () => {
      const payload: AnnouncementFormValues = {
        title: annTitle,
        content: annContent,
        target: annTarget,
        isPinned: annPinned,
      };

      if (editingAnnounce) {
        return announcementService.updateAnnouncement(editingAnnounce.id, payload);
      } else {
        return announcementService.createAnnouncement(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      toast.success(editingAnnounce ? 'Announcement updated' : 'Announcement broadcasted');
      setIsAnnounceModalOpen(false);
      setEditingAnnounce(null);
    },
  });

  const deleteAnnounceMutation = useMutation({
    mutationFn: (id: number) => announcementService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      toast.success('Announcement removed');
      setAnnounceToDelete(null);
    },
  });

  // Event Mutations
  const saveEventMutation = useMutation({
    mutationFn: async () => {
      const payload: EventFormValues = {
        title: eventTitle,
        description: eventDescription || undefined,
        type: eventType,
        startDate: new Date(eventStartDate).toISOString(),
        endDate: eventEndDate ? new Date(eventEndDate).toISOString() : undefined,
        location: eventLocation || undefined,
        meetingUrl: eventMeetingUrl || undefined,
        isAllDay: false,
      };

      if (editingEvent) {
        return eventService.updateEvent(editingEvent.id, payload);
      } else {
        return eventService.createEvent(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast.success(editingEvent ? 'Event updated' : 'Event scheduled');
      setIsEventModalOpen(false);
      setEditingEvent(null);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast.success('Event deleted');
      setEventToDelete(null);
    },
  });

  const handleOpenCreateAnnounce = () => {
    setEditingAnnounce(null);
    setAnnTitle('');
    setAnnContent('');
    setAnnTarget('all');
    setAnnPinned(false);
    setIsAnnounceModalOpen(true);
  };

  const handleOpenEditAnnounce = (a: Announcement) => {
    setEditingAnnounce(a);
    setAnnTitle(a.title);
    setAnnContent(a.content);
    setAnnTarget(a.target);
    setAnnPinned(a.isPinned);
    setIsAnnounceModalOpen(true);
  };

  const handleOpenCreateEvent = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventDescription('');
    setEventType('live_session');
    setEventStartDate(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
    setEventEndDate(new Date(Date.now() + 86400000 * 2 + 7200000).toISOString().slice(0, 16));
    setEventLocation('Virtual Classroom (Zoom)');
    setEventMeetingUrl('https://zoom.us/j/eduflow-meeting');
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (ev: Event) => {
    setEditingEvent(ev);
    setEventTitle(ev.title);
    setEventDescription(ev.description || '');
    setEventType(ev.type);
    setEventStartDate(new Date(ev.startDate).toISOString().slice(0, 16));
    setEventEndDate(
      ev.endDate
        ? new Date(ev.endDate).toISOString().slice(0, 16)
        : new Date(ev.startDate).toISOString().slice(0, 16)
    );
    setEventLocation(ev.location || '');
    setEventMeetingUrl(ev.meetingUrl || '');
    setIsEventModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication & Events"
        subtitle="Broadcast campus notices, schedule interactive sessions, and track attendee RSVPs"
        gradientTitle
      >
        <div className="flex items-center gap-2">
          {/* Tab Selector */}
          <div className="flex items-center bg-background-elevated rounded-xl p-1 border border-border-subtle text-xs">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'announcements'
                  ? 'bg-accent-indigo text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Announcements</span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'events'
                  ? 'bg-accent-indigo text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Events & RSVPs</span>
            </button>
          </div>

          {activeTab === 'announcements' ? (
            <Button onClick={handleOpenCreateAnnounce} className="shadow-lg shadow-accent-indigo/25">
              <Plus className="w-4 h-4 mr-1.5" />
              New Announcement
            </Button>
          ) : (
            <Button onClick={handleOpenCreateEvent} className="shadow-lg shadow-accent-indigo/25">
              <Plus className="w-4 h-4 mr-1.5" />
              Schedule Event
            </Button>
          )}
        </div>
      </PageHeader>

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((ann) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border transition-all ${
                  ann.isPinned
                    ? 'border-accent-indigo/40 bg-accent-indigo/5 shadow-md shadow-accent-indigo/5'
                    : 'border-border-DEFAULT bg-background-card/80'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ann.isPinned && (
                        <Badge variant="indigo" className="text-[10px] py-0 flex items-center gap-1">
                          <Pin className="w-3 h-3 rotate-45" />
                          Pinned
                        </Badge>
                      )}
                      <Badge variant="default" className="text-[10px] py-0 capitalize">
                        Target: {ann.target}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        Posted by <strong>{ann.author}</strong> •{' '}
                        {format(new Date(ann.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base text-text-primary">
                      {ann.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditAnnounce(ann)}
                      className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAnnounceToDelete(ann)}
                      className="h-8 w-8 p-0 text-status-danger hover:text-status-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {announcements.length === 0 && (
              <EmptyState
                icon={Megaphone}
                title="No announcements published"
                description="Keep students informed about important track schedules, deadlines, and workshops."
                action={{
                  label: 'Broadcast Notice',
                  onClick: handleOpenCreateAnnounce,
                  icon: Plus,
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* EVENTS TAB */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border-DEFAULT bg-background-card hover:border-accent-indigo/40 hover:shadow-card-hover transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant={
                        ev.type === 'live_session'
                          ? 'indigo'
                          : ev.type === 'deadline'
                          ? 'danger'
                          : 'cyan'
                      }
                      className="text-xs capitalize"
                    >
                      {ev.type.replace('_', ' ')}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditEvent(ev)}
                        className="h-7 w-7 p-0 text-text-muted hover:text-text-primary"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEventToDelete(ev)}
                        className="h-7 w-7 p-0 text-status-danger hover:text-status-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-text-primary line-clamp-1">
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
                      <span>{format(new Date(ev.startDate), 'EEEE, MMM d • h:mm a')}</span>
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
                          Join Link <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    Hosted by {ev.createdBy}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEventForParticipants(ev)}
                    className="h-8 text-xs border-accent-indigo/30 hover:bg-accent-indigo hover:text-white"
                  >
                    <Users className="w-3.5 h-3.5 mr-1" />
                    View RSVPs
                  </Button>
                </div>
              </motion.div>
            ))}

            {events.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={Calendar}
                  title="No scheduled events"
                  description="Host workshops, webinars, and synchronous live sessions for your cohorts."
                  action={{
                    label: 'Schedule Event',
                    onClick: handleOpenCreateEvent,
                    icon: Plus,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT CREATE / EDIT MODAL */}
      <Modal
        open={isAnnounceModalOpen}
        onClose={() => setIsAnnounceModalOpen(false)}
        title={editingAnnounce ? 'Edit Announcement' : 'Post Announcement'}
        description="Broadcast general news or targeted course updates to student feeds."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Headline Title</label>
            <Input
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g. Midterm Examination Schedule"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Target Cohort Audience</label>
            <select
              value={annTarget}
              onChange={(e) => setAnnTarget(e.target.value as any)}
              className="w-full h-10 rounded-xl bg-background-elevated border border-border-DEFAULT px-3 text-xs text-text-primary focus:border-accent-indigo focus:outline-none"
            >
              <option value="all">All Students & Faculty</option>
              <option value="group">Specific Group Cohort</option>
              <option value="course">Registered Course Members</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Message Content</label>
            <textarea
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Write the full announcement body here..."
              rows={4}
              className="w-full rounded-xl bg-background-elevated border border-border-DEFAULT p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-indigo focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="ann-pin"
              checked={annPinned}
              onChange={(e) => setAnnPinned(e.target.checked)}
              className="w-4 h-4 rounded border-border-DEFAULT bg-background-elevated text-accent-indigo"
            />
            <label htmlFor="ann-pin" className="text-xs font-medium text-text-primary cursor-pointer">
              Pin to top of student notification center
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
            <Button variant="ghost" onClick={() => setIsAnnounceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveAnnounceMutation.mutate()}
              disabled={!annTitle.trim() || saveAnnounceMutation.isPending}
            >
              {saveAnnounceMutation.isPending ? 'Publishing...' : editingAnnounce ? 'Update' : 'Broadcast'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* EVENT SCHEDULE MODAL */}
      <Modal
        open={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={editingEvent ? 'Edit Event' : 'Schedule New Event'}
        description="Set date, time, virtual meeting URL, and audience."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Event Title</label>
            <Input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Next.js 14 Deep Dive Live Q&A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full h-10 rounded-xl bg-background-elevated border border-border-DEFAULT px-3 text-xs text-text-primary focus:border-accent-indigo focus:outline-none"
              >
                <option value="live_session">Live Session / Workshop</option>
                <option value="deadline">Project Deadline</option>
                <option value="exam">Timed Exam Window</option>
                <option value="holiday">Campus Holiday</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Location</label>
              <Input
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Virtual Classroom / Room 302"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Start Time</label>
              <Input
                type="datetime-local"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                className="bg-background-elevated"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">End Time</label>
              <Input
                type="datetime-local"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="bg-background-elevated"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Meeting Link (Zoom / Meet)</label>
            <Input
              value={eventMeetingUrl}
              onChange={(e) => setEventMeetingUrl(e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Description</label>
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Agenda overview and prerequisites..."
              rows={3}
              className="w-full rounded-xl bg-background-elevated border border-border-DEFAULT p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-indigo focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
            <Button variant="ghost" onClick={() => setIsEventModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveEventMutation.mutate()}
              disabled={!eventTitle.trim() || saveEventMutation.isPending}
            >
              {saveEventMutation.isPending ? 'Scheduling...' : editingEvent ? 'Update Event' : 'Schedule Event'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* EVENT PARTICIPANTS MODAL */}
      <Modal
        open={!!selectedEventForParticipants}
        onClose={() => setSelectedEventForParticipants(null)}
        title={`Attendees: ${selectedEventForParticipants?.title || ''}`}
        description="Members who clicked 'Join' to RSVP for this event."
        size="md"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {participants.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-xl border border-border-subtle bg-background-elevated/60 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-indigo/20 text-accent-indigo flex items-center justify-center font-bold text-xs">
                  {p.userName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{p.userName}</p>
                  <p className="text-xs text-text-muted">{p.userEmail}</p>
                </div>
              </div>

              <div className="text-right">
                <Badge variant="success" className="text-[10px] py-0">
                  Confirmed RSVP
                </Badge>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Joined: {format(new Date(p.joinedAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}

          {participants.length === 0 && (
            <div className="py-8 text-center text-xs text-text-muted">
              No students have clicked &quot;Join&quot; yet for this event.
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Announcement Dialog */}
      <ConfirmDialog
        open={!!announceToDelete}
        onClose={() => setAnnounceToDelete(null)}
        onConfirm={() => {
          if (announceToDelete) deleteAnnounceMutation.mutate(announceToDelete.id);
        }}
        title="Delete Announcement"
        description={`Are you sure you want to delete "${announceToDelete?.title}"?`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteAnnounceMutation.isPending}
      />

      {/* Delete Event Dialog */}
      <ConfirmDialog
        open={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={() => {
          if (eventToDelete) deleteEventMutation.mutate(eventToDelete.id);
        }}
        title="Delete Scheduled Event"
        description={`Are you sure you want to cancel and remove "${eventToDelete?.title}"?`}
        confirmText="Delete Event"
        variant="danger"
        isLoading={deleteEventMutation.isPending}
      />
    </div>
  );
}
