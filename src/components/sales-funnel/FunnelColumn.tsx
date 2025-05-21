
"use client";

import type { Prospect, ProspectStatus } from "@/lib/prospectTypes"; // Changed to Prospect types
import { ProspectKanbanCard } from "./ProspectKanbanCard"; // Changed to ProspectKanbanCard
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FunnelColumnProps {
  status: ProspectStatus;
  prospects: Prospect[]; // Changed to Prospect[]
}

export function FunnelColumn({ status, prospects }: FunnelColumnProps) { // Changed events to prospects
  const statusColors: Record<ProspectStatus, string> = {
    "Lead": "bg-blue-500/20 border-blue-500",
    "Orçamento Enviado": "bg-yellow-500/20 border-yellow-500",
    "Marcou Degustação": "bg-orange-500/20 border-orange-500", // Added color for Marcou Degustação
    "Contratado": "bg-green-500/20 border-green-500",
    "Cancelado": "bg-red-500/20 border-red-500",
  };

  return (
    <Card className={`flex-1 min-w-[300px] max-w-[380px] shadow-lg border-t-4 ${statusColors[status]}`}>
      <CardHeader>
        <CardTitle className="text-xl text-center text-foreground">{status} ({prospects.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100vh-22rem)] pr-2"> {/* Adjusted height and padding */}
          {prospects.length > 0 ? (
            prospects.map((prospect) => <ProspectKanbanCard key={prospect.id} prospect={prospect} />) // Changed to ProspectKanbanCard
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum lead nesta etapa.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
