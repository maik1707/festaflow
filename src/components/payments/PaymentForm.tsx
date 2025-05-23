
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/datepicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvents } from "@/contexts/EventContext";
import { usePayments } from "@/contexts/PaymentContext";
import { paymentMethods } from "@/lib/paymentTypes";
import type { PaymentFormData } from "@/lib/paymentTypes";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";

const paymentFormSchema = z.object({
  eventId: z.string().min(1, { message: "Selecione um evento." }),
  paymentDate: z.date({ required_error: "A data do pagamento é obrigatória." }),
  amount: z.coerce.number().positive({ message: "O valor do pagamento deve ser positivo." }),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export function PaymentForm() {
  const router = useRouter();
  const { events, loading: eventsLoading } = useEvents();
  const { addPayment, loading: paymentsLoading } = usePayments();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      eventId: "",
      paymentDate: new Date(),
      amount: 0,
      paymentMethod: "",
      notes: "",
    },
  });

  async function onSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);
    try {
      await addPayment(data);
      toast({
        title: "Pagamento Adicionado!",
        description: `Pagamento de R$ ${data.amount.toFixed(2)} registrado com sucesso.`,
      });
      // router.push("/financials"); // Ou para a página do evento, ou limpar o formulário
      form.reset(); // Limpa o formulário após o sucesso
    } catch (error) {
      console.error("Falha ao adicionar pagamento:", error);
      toast({
        title: "Erro ao Adicionar Pagamento",
        description: "Não foi possível registrar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoading = eventsLoading || paymentsLoading || isSubmitting;

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Adicionar Novo Pagamento</CardTitle>
        <CardDescription>Registre um pagamento recebido de um cliente para um evento.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o evento referente ao pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventsLoading ? (
                        <SelectItem value="loading" disabled>Carregando eventos...</SelectItem>
                      ) : events.length === 0 ? (
                         <SelectItem value="no-events" disabled>Nenhum evento cadastrado.</SelectItem>
                      ) : (
                        events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.coupleName} - {new Date(event.eventDate).toLocaleDateString('pt-BR')}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data do Pagamento</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Pagamento (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 500.00" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Alguma observação sobre este pagamento..."
                      className="resize-y min-h-[100px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar Pagamento"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
