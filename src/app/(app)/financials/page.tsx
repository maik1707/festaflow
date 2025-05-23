
"use client";

import { useEvents } from "@/contexts/EventContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, CheckCircle, TrendingUp, BarChartHorizontalBig, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function FinancialsPage() {
  const { events, loading } = useEvents();

  const confirmedOrRealizedEvents = events.filter(
    (event) => event.status === "Confirmado" || event.status === "Realizado"
  );

  const leadOrProposalEvents = events.filter(
    (event) => event.status === "Lead" || event.status === "Proposta Enviada"
  ); // Nota: "Lead" não é mais um status de Evento, mas sim de Prospect. Esta lógica pode precisar de ajuste se os prospects devem ser incluídos aqui.

  const totalContractedValue = confirmedOrRealizedEvents.reduce(
    (sum, event) => sum + event.eventValue,
    0
  );
  
  const totalAmountPaid = confirmedOrRealizedEvents.reduce(
    (sum, event) => sum + (event.amountPaid || 0), // Garante que amountPaid seja um número
    0
  );

  const totalPendingAmount = totalContractedValue - totalAmountPaid;

  const totalPotentialValueLeads = leadOrProposalEvents.reduce( // Renomeado para clareza
    (sum, event) => sum + event.eventValue,
    0
  );
  
  // Esta métrica pode ser mais relevante com prospects
  const totalOverallPotentialValue = events.filter(event => event.status !== "Cancelado").reduce(
    (sum, event) => sum + event.eventValue,
    0
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading && events.length === 0) {
      return (
        <div className="space-y-8">
            <Card><CardHeader><CardTitle>Carregando dados financeiros...</CardTitle></CardHeader></Card>
        </div>
      )
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary">Visão Financeira</CardTitle>
          <CardDescription>Acompanhe as receitas e pagamentos dos seus eventos.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contratado (Confirmado/Realizado)</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalContractedValue)}</div>
            <p className="text-xs text-muted-foreground">
              Soma do valor total dos eventos confirmados ou realizados.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido (Confirmado/Realizado)</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmountPaid)}</div>
            <p className="text-xs text-muted-foreground">
              Soma dos valores já pagos para eventos confirmados/realizados.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente (Confirmado/Realizado)</CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Soma dos valores pendentes de pagamento.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg mt-8">
        <CardHeader>
            <CardTitle>Detalhes Financeiros dos Eventos (Confirmados/Realizados)</CardTitle>
        </CardHeader>
        <CardContent>
            {confirmedOrRealizedEvents.length > 0 ? (
              <ScrollArea className="h-[400px] pr-3">
                <ul className="space-y-4">
                    {confirmedOrRealizedEvents.map(event => (
                        <li key={event.id} className="p-4 border rounded-md bg-card shadow">
                            <h4 className="font-semibold text-lg text-primary">{event.coupleName}</h4>
                            <p className="text-sm text-muted-foreground">Status: {event.status}</p>
                            <Separator className="my-2" />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                                <div>
                                    <p className="font-medium">Valor Total:</p>
                                    <p className="text-foreground">{formatCurrency(event.eventValue)}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Valor Pago:</p>
                                    <p className="text-green-600">{formatCurrency(event.amountPaid || 0)}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Saldo Devedor:</p>
                                    <p className={`${(event.eventValue - (event.amountPaid || 0)) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(event.eventValue - (event.amountPaid || 0))}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
              </ScrollArea>
            ) : (
                <p className="text-muted-foreground">Nenhum evento confirmado ou realizado ainda.</p>
            )}
        </CardContent>
      </Card>
       <Separator className="my-8" />
       <Card className="shadow-lg mt-8">
        <CardHeader>
            <CardTitle>Observação</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                Esta é uma visão financeira simplificada. Para um controle financeiro completo,
                considere integrar com ferramentas especializadas ou adicionar funcionalidades de despesas e fluxo de caixa.
                A seção "Total Potencial (Leads)" foi removida pois os leads agora têm seu próprio funil.
            </p>
        </CardContent>
       </Card>
    </div>
  );
}
