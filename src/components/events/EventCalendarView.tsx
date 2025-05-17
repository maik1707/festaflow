"use client";

import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEvents } from '@/contexts/EventContext';
import type { Event } from '@/lib/types';
import { EventDetailsModal } from './EventDetailsModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../ui/button';
import { List, Users, CalendarDays, MapPin, Edit, Trash2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


export function EventCalendarView() {
  const { events, loading, getEventsByMonth, getEventsByDate, deleteEvent } = useEvents();
  const router = useRouter();
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const monthlyEvents = useMemo(() => getEventsByMonth(currentMonth), [currentMonth, getEventsByMonth, events]); // Added events dependency
  const dailyEvents = useMemo(() => selectedDate ? getEventsByDate(selectedDate) : [], [selectedDate, getEventsByDate, events]); // Added events dependency

  const eventDates = useMemo(() => events.map(event => event.eventDate), [events]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  
  const handleEditEvent = (eventId: string) => {
    router.push(`/events/${eventId}/edit`);
  };

  const confirmDeleteEvent = (eventId: string, eventName: string) => {
    setEventToDelete({ id: eventId, name: eventName });
  };

  const executeDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete.id);
      toast({
        title: "Evento Excluído",
        description: `O evento de ${eventToDelete.name} foi excluído.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível excluir o evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setEventToDelete(null); 
    }
  };


  const EventItem = ({event}: {event: Event}) => (
    <Card 
        className="mb-4 p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
        onClick={() => handleEventClick(event)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleEventClick(event)}
        aria-label={`Detalhes do evento ${event.coupleName}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-semibold text-lg text-primary">{event.coupleName}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><CalendarDays size={14}/> {format(event.eventDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={14}/> {event.location}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditEvent(event.id); }}>
                    <Edit size={14} className="mr-1 sm:mr-2"/> <span className="hidden sm:inline">Editar</span>
                </Button>
                <Button variant="destructive" size="sm" onClick={(e) => {e.stopPropagation(); confirmDeleteEvent(event.id, event.coupleName)}}>
                    <Trash2 size={14} className="mr-1 sm:mr-2"/> <span className="hidden sm:inline">Excluir</span>
                </Button>
            </div>
        </div>
    </Card>
  );

  if (loading && events.length === 0) { // Show skeleton only on initial load and if no events yet
    return (
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-xl">
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Calendário de Eventos</CardTitle>
            <CardDescription>Selecione uma data para ver os eventos ou clique em um evento na lista.</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border p-0"
              locale={ptBR}
              modifiers={{
                eventDay: eventDates,
              }}
              modifiersStyles={{
                eventDay: {
                  border: "2px solid hsl(var(--primary))",
                  borderRadius: '9999px',
                  color: 'hsl(var(--primary-foreground))',
                  backgroundColor: 'hsl(var(--primary)/0.2)',
                },
                selected: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                }
              }}
              footer={
                selectedDate && dailyEvents.length > 0 ? (
                  <p className="p-4 text-sm text-center">
                    {dailyEvents.length} evento(s) em {format(selectedDate, "PPP", { locale: ptBR })}.
                  </p>
                ) : selectedDate ? (
                  <p className="p-4 text-sm text-center">Nenhum evento em {format(selectedDate, "PPP", { locale: ptBR })}.</p>
                ) : (
                  <p className="p-4 text-sm text-center">Selecione um dia para ver os eventos.</p>
                )
              }
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-xl">
              <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2"><List size={22}/> Eventos do Mês</CardTitle>
                  <CardDescription>{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</CardDescription>
              </CardHeader>
              <CardContent>
                  <ScrollArea className="h-[300px] pr-3">
                  {monthlyEvents.length > 0 ? (
                      monthlyEvents.map(event => <EventItem key={event.id} event={event} />)
                  ) : (
                      <div className="text-center py-8">
                          <CalendarDays size={48} className="mx-auto text-muted-foreground opacity-50" />
                          <p className="mt-4 text-muted-foreground">Nenhum evento para este mês.</p>
                          <Button className="mt-4" onClick={() => router.push('/events/new')}>
                              <PlusCircle size={18} className="mr-2" /> Adicionar Evento
                          </Button>
                      </div>
                  )}
                  </ScrollArea>
              </CardContent>
          </Card>

          {selectedDate && (
            <Card className="shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl">Eventos em {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[200px] pr-3">
                {dailyEvents.length > 0 ? (
                    dailyEvents.map(event => <EventItem key={event.id} event={event} />)
                ) : (
                    <p className="text-muted-foreground">Nenhum evento para esta data.</p>
                )}
                </ScrollArea>
            </CardContent>
            </Card>
          )}

        </div>

        <EventDetailsModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
      {eventToDelete && (
        <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento de {eventToDelete.name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEventToDelete(null)} disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={executeDeleteEvent} disabled={isDeleting}>
                {isDeleting ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
