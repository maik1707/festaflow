"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Event } from '@/lib/types';
// TODO: Uncomment these when Firebase is configured and you're ready to implement Firestore logic
// import { db, isFirebaseConfigured } from '@/lib/firebaseConfig';
// import {
//   collection,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
//   getDocs,
//   query,
//   orderBy,
//   Timestamp
// } from 'firebase/firestore';

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

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialEventsData: Event[] = [
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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // TODO: Implement Firebase check and Firestore loading logic
      // if (isFirebaseConfigured()) {
      //   try {
      //     const eventsCollection = collection(db, "events");
      //     const q = query(eventsCollection, orderBy("eventDate", "asc"));
      //     const querySnapshot = await getDocs(q);
      //     const fetchedEvents = querySnapshot.docs.map(doc => {
      //       const data = doc.data();
      //       return {
      //         id: doc.id,
      //         ...data,
      //         eventDate: (data.eventDate as Timestamp).toDate(), // Convert Firestore Timestamp to JS Date
      //       } as Event;
      //     });
      //     setEvents(fetchedEvents);
      //   } catch (error) {
      //     console.error("Error fetching events from Firestore: ", error);
      //     // Fallback to localStorage or initialEvents if Firestore fails
      //     loadEventsFromLocalStorage();
      //   }
      // } else {
        loadEventsFromLocalStorage();
      // }
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
    // TODO: Remove this useEffect when Firestore is the source of truth and isFirebaseConfigured() is used above
    if (typeof window !== 'undefined' && !loading) { // Avoid saving empty events array on initial load before data is fetched
        // if (!isFirebaseConfigured()) { // Only save to localStorage if Firebase is not set up
           localStorage.setItem('festaFlowEvents', JSON.stringify(events));
        // }
    }
  }, [events, loading]);

  const addEvent = async (newEventData: Omit<Event, 'id' | 'status' | 'eventDate'> & { eventDate: string }): Promise<void> => {
    const newEventObjectModel: Event = {
      ...newEventData,
      id: generateId(), // Firestore will generate its own ID if using addDoc
      status: 'Lead',
      eventDate: new Date(newEventData.eventDate),
      guestCount: Number(newEventData.guestCount),
      eventValue: Number(newEventData.eventValue),
    };

    // TODO: Uncomment and implement Firestore logic when Firebase is configured
    // if (isFirebaseConfigured()) {
    //   try {
    //     const eventToSave = { ...newEventObjectModel };
    //     delete eventToSave.id; // Firestore will generate ID for addDoc
    //     const docRef = await addDoc(collection(db, "events"), {
    //       ...eventToSave,
    //       eventDate: Timestamp.fromDate(newEventObjectModel.eventDate) // Store as Firestore Timestamp
    //     });
    //     setEvents(prevEvents => [...prevEvents, {...newEventObjectModel, id: docRef.id}]);
    //   } catch (e) {
    //     console.error("Error adding document to Firestore: ", e);
    //     throw e; // Or handle error appropriately
    //   }
    // } else {
      setEvents(prevEvents => [...prevEvents, newEventObjectModel]);
    // }
  };

  const updateEvent = async (id: string, updates: Partial<Omit<Event, 'id' | 'eventDate'> & { eventDate?: string }>): Promise<void> => {
    // TODO: Uncomment and implement Firestore logic when Firebase is configured
    // if (isFirebaseConfigured()) {
    //   try {
    //     const eventDocRef = doc(db, "events", id);
    //     const firestoreUpdates: any = { ...updates };
    //     if (updates.eventDate) {
    //       firestoreUpdates.eventDate = Timestamp.fromDate(new Date(updates.eventDate));
    //     }
    //     if (updates.guestCount) {
    //        firestoreUpdates.guestCount = Number(updates.guestCount);
    //     }
    //     if (updates.eventValue) {
    //        firestoreUpdates.eventValue = Number(updates.eventValue);
    //     }
    //     await updateDoc(eventDocRef, firestoreUpdates);
    //     // Update local state optimistically or after refetch
    //     setEvents(prevEvents =>
    //       prevEvents.map(event => {
    //         if (event.id === id) {
    //           const updatedEvent = { ...event, ...updates };
    //           if (updates.eventDate) updatedEvent.eventDate = new Date(updates.eventDate);
    //           if (updates.guestCount) updatedEvent.guestCount = Number(updates.guestCount);
    //           if (updates.eventValue) updatedEvent.eventValue = Number(updates.eventValue);
    //           return updatedEvent;
    //         }
    //         return event;
    //       })
    //     );
    //   } catch (e) {
    //     console.error("Error updating document in Firestore: ", e);
    //     throw e;
    //   }
    // } else {
      setEvents(prevEvents =>
        prevEvents.map(event => {
          if (event.id === id) {
            const updatedEvent = { ...event, ...updates };
            if (updates.eventDate) updatedEvent.eventDate = new Date(updates.eventDate);
            if (updates.guestCount) updatedEvent.guestCount = Number(updates.guestCount);
            if (updates.eventValue) updatedEvent.eventValue = Number(updates.eventValue);
            return updatedEvent;
          }
          return event;
        })
      );
    // }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    // TODO: Uncomment and implement Firestore logic when Firebase is configured
    // if (isFirebaseConfigured()) {
    //   try {
    //     const eventDocRef = doc(db, "events", id);
    //     await deleteDoc(eventDocRef);
    //     setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    //   } catch (e) {
    //     console.error("Error deleting document from Firestore: ", e);
    //     throw e;
    //   }
    // } else {
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    // }
  };

  const getEventById = (id: string): Event | undefined => {
    // This will continue to work on the client-side events array,
    // which will be populated from Firestore once configured.
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
