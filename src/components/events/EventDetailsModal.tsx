
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}
from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types";
import { useEvents } from "@/contexts/EventContext";
import { usePayments } from "@/contexts/PaymentContext"; // Para buscar pagamentos
import type { Payment } from "@/lib/paymentTypes";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Users, DollarSign, Tag, Info, Trash2, Pencil, CreditCard, ListChecks } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Removido AlertDialogTrigger não utilizado
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "../ui/separator";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const { deleteEvent } = useEvents();
  const { getPaymentsForEvent, loading: paymentsLoading } = usePayments();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventPayments, setEventPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (isOpen && event) {
      const fetchPayments = async () => {
        const payments = await getPaymentsForEvent(event.id);
        setEventPayments(payments);
      };
      fetchPayments();
    } else {
      setEventPayments([]); // Limpa os pagamentos quando o modal fecha ou não há evento
    }
  }, [isOpen, event, getPaymentsForEvent]);

  if (!event) return null;

  const handleDelete = async () => {
    if (!event) return;
    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      // TODO: O que fazer com os pagamentos associados?
      // Por enquanto, eles permanecem no banco de dados.
      toast({
        title: "Evento Excluído",
        description: `O evento de ${event.coupleName} foi excluído.`,
        variant: "destructive",
      });
      onClose();
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível excluir o evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!event) return;
    router.push(`/events/${event.id}/edit`);
    onClose();
  };

  const detailItemClass = "flex items-start gap-3 text-sm text-foreground";
  const iconClass = "h-5 w-5 text-primary mt-0.5 shrink-0";
  const amountPaid = event.amountPaid || 0;
  const remainingBalance = event.eventValue - amountPaid;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl bg-card text-card-foreground rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-primary">
            {event.coupleName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detalhes do evento e pagamentos
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="grid gap-4 py-4">
            <div className={detailItemClass}>
              <Calendar className={iconClass} />
              <div>
                <strong>Data:</strong> {format(event.eventDate, "PPP 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>
            <div className={detailItemClass}>
              <MapPin className={iconClass} />
              <div>
                <strong>Local:</strong> {event.location}
              </div>
            </div>
            <div className={detailItemClass}>
              <Users className={iconClass} />
              <div>
                <strong>Convidados:</strong> {event.guestCount}
              </div>
            </div>
             <div className={detailItemClass}>
              <Tag className={iconClass} />
              <div>
                <strong>Pacote:</strong> {event.packageName}
              </div>
            </div>
            {event.extraDetails && (
              <div className={detailItemClass}>
                <Info className={iconClass} />
                <div>
                  <strong>Detalhes Extras:</strong> {event.extraDetails}
                </div>
              </div>
            )}
             <div className={detailItemClass}>
                <Info className={iconClass} /> {/* Placeholder, could be a status icon */}
                <div>
                  <strong>Status:</strong> <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground">{event.status}</span>
                </div>
              </div>

            <Separator className="my-2"/>

            <h4 className="text-md font-semibold text-primary flex items-center gap-2"><DollarSign size={18}/>Informações Financeiras</h4>
            <div className={detailItemClass}>
              <CreditCard className={iconClass} />
              <div>
                <strong>Valor Total do Evento:</strong> R$ {event.eventValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className={detailItemClass}>
              <CreditCard className={`${iconClass} text-green-600`} />
              <div>
                <strong>Valor Pago:</strong> R$ {amountPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className={detailItemClass}>
              <CreditCard className={`${iconClass} ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`} />
              <div>
                <strong>Saldo Devedor:</strong> R$ {remainingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <Separator className="my-2"/>
            
            <h4 className="text-md font-semibold text-primary flex items-center gap-2"><ListChecks size={18}/>Histórico de Pagamentos</h4>
            {paymentsLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ) : eventPayments.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {eventPayments.map(p => (
                  <li key={p.id} className="p-2 border rounded-md bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span>{format(p.paymentDate, "dd/MM/yyyy", { locale: ptBR })} - R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-xs text-muted-foreground">{p.paymentMethod || 'N/A'}</span>
                    </div>
                    {p.notes && <p className="text-xs text-muted-foreground mt-1 italic">Obs: {p.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum pagamento registrado para este evento.</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-between gap-2 pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? "Excluindo..." : "Excluir Evento"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento de {event.coupleName}. Os pagamentos associados não serão excluídos automaticamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Excluindo..." : "Excluir Evento"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto" disabled={isDeleting}>Fechar</Button>
            <Button onClick={handleEdit} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isDeleting}>
              <Pencil className="mr-2 h-4 w-4" /> Editar Evento
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
