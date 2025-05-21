
export type ProspectStatus = "Lead" | "Orçamento Enviado" | "Marcou Degustação" | "Contratado" | "Cancelou";

export const prospectStatuses: ProspectStatus[] = ["Lead", "Orçamento Enviado", "Marcou Degustação", "Contratado", "Cancelou"];

export interface Prospect {
  id: string;
  contactName: string;
  contactPlatform: string; // Ex: Instagram, WhatsApp, Telefone
  contactDetails: string; // Ex: @username, número, email
  notes?: string;
  status: ProspectStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Platforms for prospect contact origin
export const prospectPlatforms: string[] = ["Instagram", "WhatsApp", "Facebook", "Telefone", "Email", "Indicação", "Outro"];
