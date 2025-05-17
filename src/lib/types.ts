export type EventStatus = "Lead" | "Proposta Enviada" | "Confirmado" | "Realizado" | "Cancelado";

export const eventStatuses: EventStatus[] = ["Lead", "Proposta Enviada", "Confirmado", "Realizado", "Cancelado"];

export interface Event {
  id: string;
  eventDate: Date;
  coupleName: string;
  location: string;
  guestCount: number;
  eventValue: number;
  packageName: string;
  extraDetails?: string;
  status: EventStatus;
}
