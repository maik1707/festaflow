"use client";

import type { Event, EventStatus } from "@/lib/types";
import { EventKanbanCard } from "./EventKanbanCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FunnelColumnProps {
  status: EventStatus;
  events: Event[];
}

export function FunnelColumn({ status, events }: FunnelColumnProps) {
  const statusColors: Record<EventStatus, string> = {
    "Lead": "bg-blue-500/20 border-blue-500",
    "Proposta Enviada": "bg-yellow-500/20 border-yellow-500",
    "Confirmado": "bg-green-500/20 border-green-500",
    "Realizado": "bg-purple-500/20 border-purple-500",
    "Cancelado": "bg-red-500/20 border-red-500",
  };

  return (
    <Card className={`flex-1 min-w-[300px] shadow-lg border-t-4 ${statusColors[status]}`}>
      <CardHeader>
        <CardTitle className="text-xl text-center text-foreground">{status} ({events.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)] pr-3"> {/* Adjust height as needed */}
          {events.length > 0 ? (
            events.map((event) => <EventKanbanCard key={event.id} event={event} />)
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum evento nesta etapa.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
