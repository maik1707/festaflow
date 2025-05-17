"use client";

import type { Event, EventStatus } from "@/lib/types";
import { eventStatuses } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEvents } from "@/contexts/EventContext";
import { ChevronDown, Calendar, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface EventKanbanCardProps {
  event: Event;
}

export function EventKanbanCard({ event }: EventKanbanCardProps) {
  const { updateEvent } = useEvents();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChangeStatus = async (newStatus: EventStatus) => {
    if (newStatus === event.status) return;
    setIsUpdating(true);
    try {
      await updateEvent(event.id, { status: newStatus });
      toast({
        title: "Status Atualizado",
        description: `O evento de ${event.coupleName} foi movido para ${newStatus}.`,
      });
    } catch (error) {
      console.error("Failed to update event status:", error);
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar o status do evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-primary">{event.coupleName}</CardTitle>
        <CardDescription className="text-xs">
          <Calendar size={12} className="inline mr-1" /> 
          {format(event.eventDate, "dd/MM/yy", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center"><Users size={14} className="mr-2 text-muted-foreground" /> {event.guestCount} convidados</p>
        <p className="flex items-center"><DollarSign size={14} className="mr-2 text-muted-foreground" /> R$ {event.eventValue.toLocaleString('pt-BR')}</p>
        <div className="mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full" disabled={isUpdating}>
                {isUpdating ? "Movendo..." : `Mover para: ${event.status}`} <ChevronDown size={16} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {eventStatuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleChangeStatus(status)}
                  disabled={status === event.status || isUpdating}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
