
// These statuses are now primarily for Events managed by EventContext.
// Prospect statuses are defined in prospectTypes.ts
export type EventStatus = "Proposta Enviada" | "Confirmado" | "Realizado" | "Cancelado" | "Adiado";

// Adjusted statuses for Events. "Lead" is now handled by Prospects.
export const eventStatuses: EventStatus[] = ["Proposta Enviada", "Confirmado", "Realizado", "Cancelado", "Adiado"];

export interface Event {
  id: string;
  eventDate: Date;
  coupleName: string; // "Nome do Casal" or main client
  location: string;
  guestCount: number;
  eventValue: number;
  packageName: string;
  extraDetails?: string;
  status: EventStatus;
}
