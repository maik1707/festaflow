
export const paymentMethods: string[] = ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Transferência Bancária", "Boleto", "Outro"];

export interface Payment {
  id: string;
  eventId: string; // ID do evento ao qual este pagamento pertence
  eventCoupleName?: string; // Nome do casal para facilitar a exibição
  paymentDate: Date;
  amount: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
}

// Interface para os dados do formulário de pagamento
export interface PaymentFormData {
  eventId: string;
  paymentDate: Date;
  amount: number;
  paymentMethod?: string;
  notes?: string;
}
