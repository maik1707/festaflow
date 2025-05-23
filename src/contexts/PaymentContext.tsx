
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Payment, PaymentFormData } from '@/lib/paymentTypes';
import { db, isFirebaseConfigured } from '@/lib/firebaseConfig';
import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { useEvents } from './EventContext'; // Para atualizar o evento com o novo valor pago

interface PaymentContextType {
  paymentsByEvent: Record<string, Payment[]>; // Pagamentos agrupados por eventId
  loading: boolean;
  addPayment: (paymentData: PaymentFormData) => Promise<string | undefined>;
  getPaymentsForEvent: (eventId: string) => Promise<Payment[]>; // Função para buscar pagamentos de um evento específico
  // Outras funções como updatePayment, deletePayment podem ser adicionadas aqui
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [paymentsByEvent, setPaymentsByEvent] = useState<Record<string, Payment[]>>({});
  const [loading, setLoading] = useState(false); // Geralmente, o carregamento será por evento
  const { updateEvent, getEventById } = useEvents();

  // Função para buscar pagamentos de um evento específico e armazená-los no estado
  const getPaymentsForEvent = useCallback(async (eventId: string): Promise<Payment[]> => {
    if (!isFirebaseConfigured() || !db) {
      console.warn("Firebase não configurado para pagamentos.");
      return [];
    }
    setLoading(true);
    try {
      const paymentsCollection = collection(db, "payments");
      const q = query(
        paymentsCollection,
        where("eventId", "==", eventId),
        orderBy("paymentDate", "asc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedPayments = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          paymentDate: (data.paymentDate as Timestamp).toDate(),
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Payment;
      });
      setPaymentsByEvent(prev => ({ ...prev, [eventId]: fetchedPayments }));
      setLoading(false);
      return fetchedPayments;
    } catch (error) {
      console.error(`Error fetching payments for event ${eventId} from Firestore: `, error);
      setLoading(false);
      return [];
    }
  }, []);

  const addPayment = async (paymentData: PaymentFormData): Promise<string | undefined> => {
    if (!isFirebaseConfigured() || !db) {
      console.error("Firebase não configurado. Não é possível adicionar pagamento.");
      throw new Error("Firebase não configurado. Operação de adicionar pagamento falhou.");
    }
    
    const event = getEventById(paymentData.eventId);
    if (!event) {
        console.error("Evento não encontrado para adicionar pagamento.");
        throw new Error("Evento não encontrado.");
    }

    setLoading(true);
    const paymentDataForFirestore = {
      ...paymentData,
      paymentDate: Timestamp.fromDate(paymentData.paymentDate),
      amount: Number(paymentData.amount),
      createdAt: serverTimestamp(),
      eventCoupleName: event.coupleName, // Adiciona o nome do casal para referência
    };

    try {
      // Adiciona o novo pagamento
      const docRef = await addDoc(collection(db, "payments"), paymentDataForFirestore);
      
      // Atualiza o estado local de pagamentos para este evento
      const newPayment: Payment = {
        id: docRef.id,
        eventId: paymentData.eventId,
        eventCoupleName: event.coupleName,
        paymentDate: paymentData.paymentDate, // Aqui é a data JS
        amount: Number(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes,
        createdAt: new Date(), // Aproximação
      };
      
      const currentPaymentsForEvent = paymentsByEvent[paymentData.eventId] || [];
      const updatedPaymentsForEvent = [...currentPaymentsForEvent, newPayment].sort(
        (a, b) => a.paymentDate.getTime() - b.paymentDate.getTime()
      );
      setPaymentsByEvent(prev => ({ ...prev, [paymentData.eventId]: updatedPaymentsForEvent }));

      // Calcula o novo total pago para o evento
      const totalPaidForEvent = updatedPaymentsForEvent.reduce((sum, p) => sum + p.amount, 0);

      // Atualiza o campo amountPaid no documento do evento
      await updateEvent(paymentData.eventId, { amountPaid: totalPaidForEvent });
      
      setLoading(false);
      return docRef.id;
    } catch (e) {
      console.error("Error adding payment to Firestore: ", e);
      setLoading(false);
      throw e;
    }
  };

  return (
    <PaymentContext.Provider value={{ paymentsByEvent, loading, addPayment, getPaymentsForEvent }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayments must be used within a PaymentProvider');
  }
  return context;
};
