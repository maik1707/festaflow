"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Event } from '@/lib/types';
import { db, isFirebaseConfigured } from '@/lib/firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';

interface EventContextType {
  events: Event[];
  loading: boolean;
  addEvent: (newEventData: Omit<Event, 'id' | 'status' | 'eventDate'> & { eventDate: string }) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Omit<Event, 'id' | 'eventDate'> & { eventDate?: string }>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  getEventsByMonth: (date: Date) => Event[];
  getEventsByDate: (date: Date) => Event[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9); // Used for localStorage fallback

const initialEventsData: Event[] = [ // Used if localStorage is empty and Firebase not configured
  {
    id: generateId(),
    coupleName: "Ana & Bruno (Exemplo)",
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
    coupleName: "Carlos & Diana (Exemplo)",
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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (isFirebaseConfigured()) {
        try {
          const eventsCollection = collection(db, "events");
          const q = query(eventsCollection, orderBy("eventDate", "asc"));
          const querySnapshot = await getDocs(q);
          const fetchedEvents = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              eventDate: (data.eventDate as Timestamp).toDate(), // Convert Firestore Timestamp to JS Date
            } as Event;
          });
          setEvents(fetchedEvents);
        } catch (error) {
          console.error("Error fetching events from Firestore: ", error);
          // Fallback to localStorage if Firestore fails
          loadEventsFromLocalStorage();
        }
      } else {
        console.warn("Firebase não configurado. Usando localStorage.");
        loadEventsFromLocalStorage();
      }
      setLoading(false);
    };

    const loadEventsFromLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const savedEvents = localStorage.getItem('festaFlowEvents');
        const parsedEvents = savedEvents ? JSON.parse(savedEvents, (key, value) => {
          if (key === 'eventDate') return new Date(value);
          return value;
        }) : initialEventsData;
        setEvents(parsedEvents);
      } else {
        setEvents(initialEventsData); // Fallback for server-side rendering or environments without localStorage
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) { 
        if (!isFirebaseConfigured()) { // Only save to localStorage if Firebase is not set up
           localStorage.setItem('festaFlowEvents', JSON.stringify(events));
        }
    }
  }, [events, loading]);

  const addEvent = async (newEventData: Omit<Event, 'id' | 'status' | 'eventDate'> & { eventDate: string }): Promise<void> => {
    const newEventObjectModel: Event = {
      ...newEventData,
      id: generateId(), // Placeholder ID, Firestore will generate its own
      status: 'Lead',
      eventDate: new Date(newEventData.eventDate),
      guestCount: Number(newEventData.guestCount),
      eventValue: Number(newEventData.eventValue),
    };

    if (isFirebaseConfigured()) {
      try {
        // Firestore will generate ID for addDoc, so we don't pass newEventObjectModel.id
        const docRef = await addDoc(collection(db, "events"), {
          coupleName: newEventObjectModel.coupleName,
          eventDate: Timestamp.fromDate(newEventObjectModel.eventDate), // Store as Firestore Timestamp
          location: newEventObjectModel.location,
          guestCount: newEventObjectModel.guestCount,
          eventValue: newEventObjectModel.eventValue,
          packageName: newEventObjectModel.packageName,
          extraDetails: newEventObjectModel.extraDetails || "",
          status: newEventObjectModel.status,
        });
        setEvents(prevEvents => [...prevEvents, {...newEventObjectModel, id: docRef.id}]);
      } catch (e) {
        console.error("Error adding document to Firestore: ", e);
        throw e; 
      }
    } else {
      setEvents(prevEvents => [...prevEvents, newEventObjectModel]);
    }
  };

  const updateEvent = async (id: string, updates: Partial<Omit<Event, 'id' | 'eventDate'> & { eventDate?: string }>): Promise<void> => {
    if (isFirebaseConfigured()) {
      try {
        const eventDocRef = doc(db, "events", id);
        const firestoreUpdates: any = { ...updates };
        if (updates.eventDate) {
          firestoreUpdates.eventDate = Timestamp.fromDate(new Date(updates.eventDate));
        }
        if (updates.guestCount !== undefined) {
           firestoreUpdates.guestCount = Number(updates.guestCount);
        }
        if (updates.eventValue !== undefined) {
           firestoreUpdates.eventValue = Number(updates.eventValue);
        }
        // Remove id from updates object if it exists, as it's the doc identifier
        if ('id' in firestoreUpdates) {
            delete firestoreUpdates.id;
        }

        await updateDoc(eventDocRef, firestoreUpdates);
        
        setEvents(prevEvents =>
          prevEvents.map(event => {
            if (event.id === id) {
              const updatedEvent = { ...event, ...updates };
              if (updates.eventDate) updatedEvent.eventDate = new Date(updates.eventDate);
              if (updates.guestCount !== undefined) updatedEvent.guestCount = Number(updates.guestCount);
              if (updates.eventValue !== undefined) updatedEvent.eventValue = Number(updates.eventValue);
              return updatedEvent;
            }
            return event;
          })
        );
      } catch (e) {
        console.error("Error updating document in Firestore: ", e);
        throw e;
      }
    } else {
      setEvents(prevEvents =>
        prevEvents.map(event => {
          if (event.id === id) {
            const updatedEvent = { ...event, ...updates };
            if (updates.eventDate) updatedEvent.eventDate = new Date(updates.eventDate);
            if (updates.guestCount !== undefined) updatedEvent.guestCount = Number(updates.guestCount);
            if (updates.eventValue !== undefined) updatedEvent.eventValue = Number(updates.eventValue);
            return updatedEvent;
          }
          return event;
        })
      );
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    if (isFirebaseConfigured()) {
      try {
        const eventDocRef = doc(db, "events", id);
        await deleteDoc(eventDocRef);
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
      } catch (e) {
        console.error("Error deleting document from Firestore: ", e);
        throw e;
      }
    } else {
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    }
  };

  const getEventById = (id: string): Event | undefined => {
    return events.find(event => event.id === id);
  };
  
  const getEventsByMonth = (date: Date): Event[] => {
    return events.filter(event => 
      event.eventDate.getFullYear() === date.getFullYear() &&
      event.eventDate.getMonth() === date.getMonth()
    ).sort((a,b) => a.eventDate.getTime() - b.eventDate.getTime());
  };

  const getEventsByDate = (date: Date): Event[] => {
    return events.filter(event =>
      event.eventDate.getFullYear() === date.getFullYear() &&
      event.eventDate.getMonth() === date.getMonth() &&
      event.eventDate.getDate() === date.getDate()
    ).sort((a,b) => a.eventDate.getTime() - b.eventDate.getTime());
  };


  return (
    <EventContext.Provider value={{ events, loading, addEvent, updateEvent, deleteEvent, getEventById, getEventsByMonth, getEventsByDate }}>
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
