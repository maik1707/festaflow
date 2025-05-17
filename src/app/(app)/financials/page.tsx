"use client";

import { useEvents } from "@/contexts/EventContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, CheckCircle, TrendingUp, BarChartHorizontalBig } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function FinancialsPage() {
  const { events } = useEvents();

  const confirmedOrRealizedEvents = events.filter(
    (event) => event.status === "Confirmado" || event.status === "Realizado"
  );

  const leadOrProposalEvents = events.filter(
    (event) => event.status === "Lead" || event.status === "Proposta Enviada"
  );

  const totalIncomeConfirmed = confirmedOrRealizedEvents.reduce(
    (sum, event) => sum + event.eventValue,
    0
  );

  const totalIncomePotential = leadOrProposalEvents.reduce(
    (sum, event) => sum + event.eventValue,
    0
  );

  const totalOverallPotential = events.filter(event => event.status !== "Cancelado").reduce(
    (sum, event) => sum + event.eventValue,
    0
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary">Visão Financeira</CardTitle>
          <CardDescription>Acompanhe as receitas dos seus eventos.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Confirmada/Realizada</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncomeConfirmed)}</div>
            <p className="text-xs text-muted-foreground">
              Soma dos eventos confirmados ou já realizados.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Potencial (Lead/Proposta)</CardTitle>
            <TrendingUp className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncomePotential)}</div>
            <p className="text-xs text-muted-foreground">
              Soma dos eventos em prospecção ou com proposta enviada.
            </p>
          </CardContent>
        </Card>
         <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Potencial Geral</CardTitle>
            <BarChartHorizontalBig className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOverallPotential)}</div>
            <p className="text-xs text-muted-foreground">
              Soma de todos os eventos não cancelados.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg mt-8">
        <CardHeader>
            <CardTitle>Detalhes dos Eventos Confirmados/Realizados</CardTitle>
        </CardHeader>
        <CardContent>
            {confirmedOrRealizedEvents.length > 0 ? (
                <ul className="space-y-3">
                    {confirmedOrRealizedEvents.map(event => (
                        <li key={event.id} className="p-3 border rounded-md bg-muted/30">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold">{event.coupleName}</h4>
                                    <p className="text-sm text-muted-foreground">Status: {event.status}</p>
                                </div>
                                <p className="font-semibold text-lg text-green-600">{formatCurrency(event.eventValue)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
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
            </p>
        </CardContent>
       </Card>
    </div>
  );
}
