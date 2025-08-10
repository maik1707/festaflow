
"use client";

import { useProspects } from "@/contexts/ProspectContext"; // Changed to useProspects
import { FunnelColumn } from "@/components/sales-funnel/FunnelColumn";
import { prospectStatuses } from "@/lib/prospectTypes"; // Changed to prospectStatuses
import type { ProspectStatus } from "@/lib/prospectTypes"; // Changed to ProspectStatus
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


export default function SalesFunnelPage() {
  const { prospects, loading, getProspectsByStatus } = useProspects(); // Changed to useProspects

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-md">
            <CardHeader>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
        </Card>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {prospectStatuses.map((status) => (
            <div key={status} className="flex-1 min-w-[300px] max-w-[380px] space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Funil de Leads</CardTitle>
              <CardDescription>
                Gerencie seus leads desde o primeiro contato até o fechamento.
              </CardDescription>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/prospects/new">
                <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Novo Lead
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <p className="text-muted-foreground mb-6">
          Utilize o menu suspenso no cartão de cada lead para atualizar o status.
          A funcionalidade de arrastar e soltar não está implementada.
      </p>
      <div className="flex-grow flex gap-6 overflow-x-auto pb-4">
          {prospectStatuses.map((status) => (
          <FunnelColumn
              key={status}
              status={status}
              prospects={getProspectsByStatus(status)} // Changed to getProspectsByStatus
          />
          ))}
      </div>
    </div>
  );
}
