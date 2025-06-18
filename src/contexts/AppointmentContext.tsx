
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Appointment, AppointmentFormData } from '@/lib/appointmentTypes';
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
  serverTimestamp,
  where,
} from 'firebase/firestore';
// Para obter o usuário logado, se necessário no futuro. Por enquanto, assumimos um único admin.
// import { useAuth } from './AuthContext'; // Se tivéssemos um AuthContext

interface AppointmentContextType {
  appointments: Appointment[];
  loading: boolean;
  addAppointment: (newAppointmentData: AppointmentFormData) => Promise<string | undefined>;
  updateAppointment: (id: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'appointmentDate'> & { appointmentDate?: Date | null }>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  toggleComplete: (id: string, isCompleted: boolean) => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  // const { user } = useAuth(); // Exemplo se tivéssemos autenticação de múltiplos usuários

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    if (!isFirebaseConfigured() || !db) {
      console.warn("Firebase não configurado para compromissos. Os dados não serão carregados ou persistidos.");
      setAppointments([]);
      setLoading(false);
      return;
    }

    // const currentUserId = user?.uid || "admin_user"; // Exemplo: usar ID do usuário ou um fixo
    // Por simplicidade, não vamos filtrar por userId agora, mas seria importante para multi-usuário

    try {
      const appointmentsCollection = collection(db, "appointments");
      // Poderíamos filtrar por userId aqui se necessário: query(appointmentsCollection, where("userId", "==", currentUserId), orderBy("createdAt", "desc"))
      const q = query(appointmentsCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedAppointments = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          appointmentDate: (data.appointmentDate as Timestamp)?.toDate() || null,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        } as Appointment;
      });
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error fetching appointments from Firestore: ", error);
      setAppointments([]);
    }
    setLoading(false);
  }, []); // Adicionar 'user' como dependência se filtrar por usuário

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const addAppointment = async (newAppointmentData: AppointmentFormData): Promise<string | undefined> => {
    if (!isFirebaseConfigured() || !db) {
      console.error("Firebase não configurado. Não é possível adicionar compromisso.");
      throw new Error("Firebase não configurado.");
    }

    // const currentUserId = user?.uid || "admin_user"; 

    const appointmentDataForFirestore: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any, appointmentDate: Timestamp | null } = {
      title: newAppointmentData.title,
      details: newAppointmentData.details || "",
      appointmentDate: newAppointmentData.appointmentDate ? Timestamp.fromDate(newAppointmentData.appointmentDate) : null,
      isCompleted: false,
      // userId: currentUserId, 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "appointments"), appointmentDataForFirestore);
      // Refetch ou adicionar otimisticamente
      loadAppointments(); // Simples refetch por agora
      return docRef.id;
    } catch (e) {
      console.error("Error adding appointment to Firestore: ", e);
      throw e;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'appointmentDate'> & { appointmentDate?: Date | null }>) => {
    if (!isFirebaseConfigured() || !db) {
      console.error("Firebase não configurado. Não é possível atualizar compromisso.");
      throw new Error("Firebase não configurado.");
    }
    try {
      const appointmentDocRef = doc(db, "appointments", id);
      const firestoreUpdates: any = { ...updates, updatedAt: serverTimestamp() };
      if (updates.hasOwnProperty('appointmentDate')) { // Checa se appointmentDate está explicitamente no updates
         firestoreUpdates.appointmentDate = updates.appointmentDate ? Timestamp.fromDate(updates.appointmentDate) : null;
      }

      await updateDoc(appointmentDocRef, firestoreUpdates);
      loadAppointments(); // Simples refetch
    } catch (e) {
      console.error("Error updating appointment in Firestore: ", e);
      throw e;
    }
  };
  
  const toggleComplete = async (id: string, isCompleted: boolean) => {
     await updateAppointment(id, { isCompleted });
  };

  const deleteAppointment = async (id: string) => {
    if (!isFirebaseConfigured() || !db) {
      console.error("Firebase não configurado. Não é possível excluir compromisso.");
      throw new Error("Firebase não configurado.");
    }
    try {
      await deleteDoc(doc(db, "appointments", id));
      loadAppointments(); // Simples refetch
    } catch (e) {
      console.error("Error deleting appointment from Firestore: ", e);
      throw e;
    }
  };

  return (
    <AppointmentContext.Provider value={{ appointments, loading, addAppointment, updateAppointment, deleteAppointment, toggleComplete }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
