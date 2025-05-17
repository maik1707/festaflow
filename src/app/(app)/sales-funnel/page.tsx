"use client";

import { useEvents } from "@/contexts/EventContext";
import { FunnelColumn } from "@/components/sales-funnel/FunnelColumn";
import { eventStatuses } from "@/lib/types";
import type { EventStatus } from "@/lib/types";

export default function SalesFunnelPage() {
  const { events } = useEvents();

  const eventsByStatus = (status: EventStatus) => {
    return events.filter(event => event.status === status).sort((a,b) => a.eventDate.getTime() - b.eventDate.getTime());
  };

  return (
    <div className="flex flex-col h-full">
        <p className="text-muted-foreground mb-6">
            Arraste (ou use o menu em cada cartão) os eventos entre as colunas para atualizar o status.
            A funcionalidade de arrastar e soltar não está implementada nesta versão. Utilize o menu suspenso no cartão.
        </p>
        <div className="flex-grow flex gap-6 overflow-x-auto pb-4">
            {eventStatuses.map((status) => (
            <FunnelColumn
                key={status}
                status={status}
                events={eventsByStatus(status)}
            />
            ))}
        </div>
    </div>
  );
}
