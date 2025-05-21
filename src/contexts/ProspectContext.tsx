
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
  where,
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

const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial data for localStorage fallback
const initialProspectsData: Prospect[] = [
  {
    id: generateId(),
    contactName: "Maria Silva (Exemplo Lead)",
    contactPlatform: "Instagram",
    contactDetails: "@mariasilva",
    status: "Lead",
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: "Interessada em pacote para casamento pequeno."
  },
  {
    id: generateId(),
    contactName: "João Santos (Exemplo Orçamento)",
    contactPlatform: "WhatsApp",
    contactDetails: "(11) 99999-8888",
    status: "Orçamento Enviado",
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
    notes: "Pediu orçamento para festa de 15 anos, 100 pessoas."
  }
];


export const ProspectProvider = ({ children }: { children: ReactNode }) => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProspectsFromLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedProspects = localStorage.getItem('festaFlowProspects');
      const parsedProspects = savedProspects ? JSON.parse(savedProspects, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
        return value;
      }) : initialProspectsData;
      setProspects(parsedProspects);
    } else {
      setProspects(initialProspectsData);
    }
  }, []);

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    if (isFirebaseConfigured()) {
      try {
        const prospectsCollection = collection(db, "prospects");
        const q = query(prospectsCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedProspects = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
          } as Prospect;
        });
        setProspects(fetchedProspects);
      } catch (error) {
        console.error("Error fetching prospects from Firestore: ", error);
        loadProspectsFromLocalStorage(); // Fallback to localStorage
      }
    } else {
      console.warn("Firebase não configurado para prospects. Usando localStorage.");
      loadProspectsFromLocalStorage();
    }
    setLoading(false);
  }, [loadProspectsFromLocalStorage]);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !loading && !isFirebaseConfigured()) {
      localStorage.setItem('festaFlowProspects', JSON.stringify(prospects));
    }
  }, [prospects, loading]);

  const addProspect = async (newProspectData: Omit<Prospect, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string | undefined> => {
    const prospectToAdd: Omit<Prospect, 'id'> = {
      ...newProspectData,
      status: 'Lead',
      createdAt: new Date(), // Placeholder, Firestore will use serverTimestamp
      updatedAt: new Date(), // Placeholder
    };

    if (isFirebaseConfigured()) {
      try {
        const docRef = await addDoc(collection(db, "prospects"), {
          ...prospectToAdd,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        // Optimistically update UI, or refetch. For simplicity, let's refetch or add manually.
        // Adding manually to avoid immediate refetch for better UX
        setProspects(prev => [{...prospectToAdd, id: docRef.id, createdAt: new Date(), updatedAt: new Date()}, ...prev ]);
        return docRef.id;
      } catch (e) {
        console.error("Error adding prospect to Firestore: ", e);
        throw e;
      }
    } else {
      const newId = generateId();
      const newProspectWithId = {...prospectToAdd, id: newId, createdAt: new Date(), updatedAt: new Date()};
      setProspects(prev => [newProspectWithId, ...prev]);
      return newId;
    }
  };

  const updateProspect = async (id: string, updates: Partial<Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (isFirebaseConfigured()) {
      try {
        const prospectDocRef = doc(db, "prospects", id);
        await updateDoc(prospectDocRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
        setProspects(prev =>
          prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p))
        );
      } catch (e) {
        console.error("Error updating prospect in Firestore: ", e);
        throw e;
      }
    } else {
      setProspects(prev =>
        prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p))
      );
    }
  };

  const deleteProspect = async (id: string) => {
    if (isFirebaseConfigured()) {
      try {
        await deleteDoc(doc(db, "prospects", id));
        setProspects(prev => prev.filter(p => p.id !== id));
      } catch (e) {
        console.error("Error deleting prospect from Firestore: ", e);
        throw e;
      }
    } else {
      setProspects(prev => prev.filter(p => p.id !== id));
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
