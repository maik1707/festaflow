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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Users, DollarSign, Tag, Info, Trash2, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const { deleteEvent } = useEvents();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!event) return null;

  const handleDelete = async () => {
    if (!event) return;
    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
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
  const iconClass = "h-5 w-5 text-primary mt-0.5";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-primary">
            {event.coupleName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detalhes do evento
          </DialogDescription>
        </DialogHeader>
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
            <DollarSign className={iconClass} />
            <div>
              <strong>Valor:</strong> R$ {event.eventValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? "Excluindo..." : "Excluir"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento de {event.coupleName}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto" disabled={isDeleting}>Fechar</Button>
            <Button onClick={handleEdit} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isDeleting}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
