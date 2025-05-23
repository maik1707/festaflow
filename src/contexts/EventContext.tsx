
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

interface EventContextType {
  events: Event[];
  loading: boolean;
  addEvent: (newEventData: Omit<Event, 'id' | 'status' | 'eventDate' | 'amountPaid'> & { eventDate: string }) => Promise<string | undefined>;
  updateEvent: (id: string, updates: Partial<Omit<Event, 'id' | 'eventDate'> & { eventDate?: string }>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  getEventsByMonth: (date: Date) => Event[];
  getEventsByDate: (date: Date) => Event[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    if (!isFirebaseConfigured() || !db) {
      console.warn("Firebase não configurado para eventos. Os dados não serão carregados ou persistidos. Certifique-se de que as variáveis de ambiente do Firebase estão configuradas.");
      setEvents([]); // Carrega lista vazia se Firebase não configurado
      setLoading(false);
      return;
    }
    try {
      const eventsCollection = collection(db, "events");
      const q = query(eventsCollection, orderBy("eventDate", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedEvents = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          eventDate: (data.eventDate as Timestamp).toDate(),
          amountPaid: data.amountPaid || 0, // Garante que amountPaid exista e seja no mínimo 0
        } as Event;
      });
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events from Firestore: ", error);
      setEvents([]);
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    loadData();
  }, [loadData]);


  const addEvent = async (newEventData: Omit<Event, 'id' | 'status' | 'eventDate' | 'amountPaid'> & { eventDate: string }): Promise<string | undefined> => {
    if (!isFirebaseConfigured() || !db) {
      console.error("Firebase não configurado. Não é possível adicionar evento.");
      throw new Error("Firebase não configurado. Operação de adicionar evento falhou.");
    }

    const newEventObjectModel: Omit<Event, 'id'> = {
      ...newEventData,
      status: 'Confirmado',
      eventDate: new Date(newEventData.eventDate),
      guestCount: Number(newEventData.guestCount),
      eventValue: Number(newEventData.eventValue),
      extraDetails: newEventData.extraDetails || "",
      amountPaid: 0, // Inicializa amountPaid como 0
    };

    try {
      const docRef = await addDoc(collection(db, "events"), {
        ...newEventObjectModel,
        eventDate: Timestamp.fromDate(newEventObjectModel.eventDate),
        createdAt: serverTimestamp(), // Optional: if you want to track creation time
      });
      setEvents(prevEvents => [...prevEvents, {...newEventObjectModel, id: docRef.id}].sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime()));
      return docRef.id;
    } catch (e) {
      console.error("Error adding document to Firestore: ", e);
      throw e; 
    }
  };

  const updateEvent = async (id: string, updates: Partial<Omit<Event, 'id' | 'eventDate'> & { eventDate?: string }>): Promise<void> => {
    if (!isFirebaseConfigured() || !db) {
      console.error("Firebase não configurado. Não é possível atualizar evento.");
      throw new Error("Firebase não configurado. Operação de atualizar evento falhou.");
    }

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
      if (updates.amountPaid !== undefined) { // Garante que amountPaid seja numérico
        firestoreUpdates.amountPaid = Number(updates.amountPaid);
      }
      firestoreUpdates.updatedAt = serverTimestamp(); // Optional: track update time

      await updateDoc(eventDocRef, firestoreUpdates);
      
      setEvents(prevEvents =>
        prevEvents.map(event => {
          if (event.id === id) {
            const updatedEvent = { ...event, ...updates };
            if (updates.eventDate) updatedEvent.eventDate = new Date(updates.eventDate);
            if (updates.guestCount !== undefined) updatedEvent.guestCount = Number(updates.guestCount);
            if (updates.eventValue !== undefined) updatedEvent.eventValue = Number(updates.eventValue);
            if (updates.amountPaid !== undefined) updatedEvent.amountPaid = Number(updates.amountPaid);
            return updatedEvent;
          }
          return event;
        }).sort((a,b) => a.eventDate.getTime() - b.eventDate.getTime())
      );
    } catch (e) {
      console.error("Error updating document in Firestore: ", e);
      throw e;
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
     if (!isFirebaseConfigured() || !db) {
      console.error("Firebase não configurado. Não é possível excluir evento.");
      throw new Error("Firebase não configurado. Operação de excluir evento falhou.");
    }
    try {
      // TODO: Considerar o que fazer com os pagamentos associados a este evento.
      // Por enquanto, eles permanecerão no banco de dados, mas não serão facilmente acessíveis.
      // Uma opção seria excluí-los também, ou arquivá-los.
      const eventDocRef = doc(db, "events", id);
      await deleteDoc(eventDocRef);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    } catch (e) {
      console.error("Error deleting document from Firestore: ", e);
      throw e;
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
