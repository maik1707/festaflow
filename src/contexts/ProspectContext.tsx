
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Prospect, ProspectStatus } from '@/lib/prospectTypes';
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
} from 'firebase/firestore';

interface ProspectContextType {
  prospects: Prospect[];
  loading: boolean;
  addProspect: (newProspectData: Omit<Prospect, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string | undefined>;
  updateProspect: (id: string, updates: Partial<Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteProspect: (id: string) => Promise<void>;
  getProspectById: (id: string) => Prospect | undefined;
  getProspectsByStatus: (status: ProspectStatus) => Prospect[];
}

const ProspectContext = createContext<ProspectContextType | undefined>(undefined);

// Initial sample data for UI demonstration if Firebase isn't set up.
// For an "official application", operations should fail or be disabled.
const initialProspectsData: Prospect[] = [
  // {
  //   id: "sample1",
  //   contactName: "Maria Silva (Exemplo Lead)",
  //   contactPlatform: "Instagram",
  //   contactDetails: "@mariasilva",
  //   status: "Lead",
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  //   notes: "Interessada em pacote para casamento pequeno."
  // }
];


export const ProspectProvider = ({ children }: { children: ReactNode }) => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    if (isFirebaseConfigured() && db) {
      try {
        const prospectsCollection = collection(db, "prospects");
        const q = query(prospectsCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedProspects = querySnapshot.docs.map(docSnapshot => { // Renamed doc to docSnapshot
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
          } as Prospect;
        });
        setProspects(fetchedProspects);
      } catch (error) {
        console.error("Error fetching prospects from Firestore: ", error);
        setProspects(initialProspectsData); // Fallback to empty or sample if error
      }
    } else {
      console.warn("Firebase não configurado para prospects. Os dados não serão carregados ou persistidos.");
      setProspects(initialProspectsData); // Set to empty or sample
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const addProspect = async (newProspectData: Omit<Prospect, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string | undefined> => {
    if (!isFirebaseConfigured() || !db) {
      console.error("Firebase não configurado. Não é possível adicionar prospect.");
      throw new Error("Firebase não configurado. Operação de adicionar prospect falhou.");
    }
    
    const prospectDataForFirestore = {
      ...newProspectData,
      status: 'Lead' as ProspectStatus, // Default status
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "prospects"), prospectDataForFirestore);
      // Optimistically update UI or refetch, for simplicity, add manually after server confirmation:
      const newProspectFromDb: Prospect = {
          ...newProspectData,
          id: docRef.id,
          status: 'Lead',
          createdAt: new Date(), // Approximate, actual value is server-generated
          updatedAt: new Date(), // Approximate
      };
      setProspects(prev => [newProspectFromDb, ...prev].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
      return docRef.id;
    } catch (e) {
      console.error("Error adding prospect to Firestore: ", e);
      throw e;
    }
  };

  const updateProspect = async (id: string, updates: Partial<Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!isFirebaseConfigured() || !db) {
      console.error("Firebase não configurado. Não é possível atualizar prospect.");
      throw new Error("Firebase não configurado. Operação de atualizar prospect falhou.");
    }
    try {
      const prospectDocRef = doc(db, "prospects", id);
      await updateDoc(prospectDocRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      setProspects(prev =>
        prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)) // Approximate updatedAt for UI
             .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
      );
    } catch (e) {
      console.error("Error updating prospect in Firestore: ", e);
      throw e;
    }
  };

  const deleteProspect = async (id: string) => {
    if (!isFirebaseConfigured() || !db) {
      console.error("Firebase não configurado. Não é possível excluir prospect.");
      throw new Error("Firebase não configurado. Operação de excluir prospect falhou.");
    }
    try {
      await deleteDoc(doc(db, "prospects", id));
      setProspects(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error("Error deleting prospect from Firestore: ", e);
      throw e;
    }
  };

  const getProspectById = (id: string): Prospect | undefined => {
    return prospects.find(p => p.id === id);
  };

  const getProspectsByStatus = (status: ProspectStatus): Prospect[] => {
    return prospects
      .filter(p => p.status === status)
      .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  };

  return (
    <ProspectContext.Provider value={{ prospects, loading, addProspect, updateProspect, deleteProspect, getProspectById, getProspectsByStatus }}>
      {children}
    </ProspectContext.Provider>
  );
};

export const useProspects = () => {
  const context = useContext(ProspectContext);
  if (context === undefined) {
    throw new Error('useProspects must be used within a ProspectProvider');
  }
  return context;
};
