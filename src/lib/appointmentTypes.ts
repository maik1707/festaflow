
import type { Timestamp } from 'firebase/firestore';

export interface Appointment {
  id: string;
  title: string;
  details?: string;
  appointmentDate?: Date | null; // Data e hora do compromisso
  isCompleted: boolean;
  createdAt: Timestamp | Date; // Pode ser Timestamp do Firestore ou Date no cliente
  updatedAt: Timestamp | Date; // Pode ser Timestamp do Firestore ou Date no cliente
  // userId: string; // Poderia ser usado se houvesse múltiplos usuários
}

export interface AppointmentFormData {
  title: string;
  details?: string;
  appointmentDate?: Date | null;
}

export const appointmentDefaultValues: AppointmentFormData = {
  title: "",
  details: "",
  appointmentDate: null,
};
