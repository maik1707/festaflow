"use client";

import { useParams, useRouter } from 'next/navigation';
import { EventForm } from '@/components/events/EventForm';
import { useEvents } from '@/contexts/EventContext';
import { useEffect, useState } from 'react';
import type { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { getEventById } = useEvents();
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const eventId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (eventId) {
      const foundEvent = getEventById(eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        // Optionally handle event not found, e.g., redirect or show error
        // For now, EventForm will just show empty fields if event is undefined.
        // Or better, redirect:
        // router.push('/calendar'); // Or a 404 page
      }
    }
    setLoading(false);
  }, [eventId, getEventById, router]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!event && !loading) {
     return <p>Evento não encontrado.</p>;
  }

  return (
    <div>
      <EventForm event={event} />
    </div>
  );
}
