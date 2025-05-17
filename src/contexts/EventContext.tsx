"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Event } from '@/lib/types';
import { eventStatuses } from '@/lib/types';

interface EventContextType {
  events: Event[];
  addEvent: (newEventData: Omit<Event, 'id' | 'status' | 'eventDate'> & { eventDate: string }) => void;
  updateEvent: (id: string, updates: Partial<Omit<Event, 'id' | 'eventDate'> & { eventDate?: string }>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
  getEventsByMonth: (date: Date) => Event[];
  getEventsByDate: (date: Date) => Event[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialEvents: Event[] = [
  {
    id: generateId(),
    coupleName: "Ana & Bruno",
    eventDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 18, 0),
    location: "Salão Sol e Lua",
    guestCount: 150,
    eventValue: 12000,
    packageName: "Pacote Diamante",
    extraDetails: "Decoração floral branca e rosa. DJ incluso.",
    status: "Confirmado",
  },
  {
    id: generateId(),
    coupleName: "Carlos & Diana",
    eventDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5, 16, 30),
    location: "Chácara Recanto Verde",
    guestCount: 80,
    eventValue: 7500,
    packageName: "Pacote Ouro",
    extraDetails: "Cerimônia ao ar livre. Banda ao vivo.",
    status: "Proposta Enviada",
  },
];

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(() => {
    if (typeof window !== 'undefined') {
      const savedEvents = localStorage.getItem('festaFlowEvents');
      return savedEvents ? JSON.parse(savedEvents, (key, value) => {
        if (key === 'eventDate') return new Date(value);
        return value;
      }) : initialEvents;
    }
    return initialEvents;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('festaFlowEvents', JSON.stringify(events));
    }
  }, [events]);

  const addEvent = (newEventData: Omit<Event, 'id' | 'status' | 'eventDate'> & { eventDate: string }) => {
    const newEvent: Event = {
      ...newEventData,
      id: generateId(),
      status: 'Lead',
      eventDate: new Date(newEventData.eventDate), // Ensure correct date parsing
      guestCount: Number(newEventData.guestCount),
      eventValue: Number(newEventData.eventValue),
    };
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<Omit<Event, 'id' | 'eventDate'> & { eventDate?: string }>) => {
    setEvents(prevEvents =>
      prevEvents.map(event => {
        if (event.id === id) {
          const updatedEvent = { ...event, ...updates };
          if (updates.eventDate) {
            updatedEvent.eventDate = new Date(updates.eventDate);
          }
          if (updates.guestCount) {
            updatedEvent.guestCount = Number(updates.guestCount);
          }
          if (updates.eventValue) {
            updatedEvent.eventValue = Number(updates.eventValue);
          }
          return updatedEvent;
        }
        return event;
      })
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };
  
  const getEventsByMonth = (date: Date) => {
    return events.filter(event => 
      event.eventDate.getFullYear() === date.getFullYear() &&
      event.eventDate.getMonth() === date.getMonth()
    ).sort((a,b) => a.eventDate.getTime() - b.eventDate.getTime());
  };

  const getEventsByDate = (date: Date) => {
    return events.filter(event =>
      event.eventDate.getFullYear() === date.getFullYear() &&
      event.eventDate.getMonth() === date.getMonth() &&
      event.eventDate.getDate() === date.getDate()
    ).sort((a,b) => a.eventDate.getTime() - b.eventDate.getTime());
  };


  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, getEventById, getEventsByMonth, getEventsByDate }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
