
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/datepicker";
import { useEvents } from "@/contexts/EventContext";
import type { Event } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const eventFormSchema = z.object({
  coupleName: z.string().min(2, {
    message: "O nome do casal deve ter pelo menos 2 caracteres.",
  }),
  eventDate: z.date({
    required_error: "A data do evento é obrigatória.",
  }),
  location: z.string().min(3, {
    message: "O local do evento deve ter pelo menos 3 caracteres.",
  }),
  guestCount: z.coerce.number().int().positive({
    message: "O número de convidados deve ser positivo.",
  }),
  eventValue: z.coerce.number().positive({
    message: "O valor do evento deve ser positivo.",
  }),
  packageName: z.string().min(2, {
    message: "O nome do pacote deve ter pelo menos 2 caracteres.",
  }),
  extraDetails: z.string().optional(),
  // amountPaid não é editável aqui, mas precisa estar no schema se for parte do defaultValues
  amountPaid: z.number().optional(), 
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event; // Optional: for editing existing event
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const { addEvent, updateEvent } = useEvents();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = event 
    ? { 
        ...event, 
        guestCount: Number(event.guestCount), 
        eventValue: Number(event.eventValue),
        amountPaid: Number(event.amountPaid || 0) // Garante que seja número
      } 
    : {
        coupleName: "",
        eventDate: undefined,
        location: "",
        guestCount: 0,
        eventValue: 0,
        packageName: "",
        extraDetails: "",
        amountPaid: 0,
      };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });
  
  // Se for um evento existente, atualiza o valor de amountPaid no formulário
  // caso ele mude no contexto (ex: após um novo pagamento ser adicionado).
  useEffect(() => {
    if (event) {
      form.setValue('amountPaid', Number(event.amountPaid || 0));
    }
  }, [event, form]);


  async function onSubmit(data: EventFormValues) {
    setIsSubmitting(true);
    // Não incluímos amountPaid nos dados a serem enviados para addEvent/updateEvent via formulário,
    // pois ele é gerenciado pelo PaymentContext.
    // No entanto, a função updateEvent no EventContext PODE receber amountPaid.
    const { amountPaid, ...eventDataToSubmit } = data;
    
    const formattedData = {
      ...eventDataToSubmit,
      eventDate: format(data.eventDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    };

    try {
      if (event) {
        // Ao atualizar, não passamos amountPaid diretamente do formulário.
        // Ele é atualizado via PaymentContext -> EventContext.updateEvent
        await updateEvent(event.id, formattedData);
        toast({
          title: "Evento Atualizado!",
          description: `O evento de ${data.coupleName} foi atualizado com sucesso.`,
        });
      } else {
        // addEvent no EventContext já inicializa amountPaid como 0.
        await addEvent(formattedData);
        toast({
          title: "Evento Cadastrado!",
          description: `O evento de ${data.coupleName} foi cadastrado com sucesso.`,
        });
      }
      router.push("/calendar"); 
    } catch (error) {
      console.error("Failed to save event:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentAmountPaid = form.watch('amountPaid') || 0;
  const eventValue = form.watch('eventValue') || 0;
  const remainingBalance = eventValue - currentAmountPaid;

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{event ? "Editar Evento" : "Cadastrar Novo Evento"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="coupleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Casal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João & Maria" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data do Evento</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local do Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Salão Festa Linda" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Convidados</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 100" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total do Evento (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 5000.00" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormItem>
                <FormLabel>Valor Pago (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={currentAmountPaid.toFixed(2)} 
                    readOnly 
                    className="bg-muted cursor-not-allowed"
                  />
                </FormControl>
                 <FormDescription>
                    Saldo Devedor: R$ {remainingBalance.toFixed(2)}
                </FormDescription>
              </FormItem>
            </div>

            {currentAmountPaid > eventValue && eventValue > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção!</AlertTitle>
                    <AlertDescription>
                    O valor pago (R$ {currentAmountPaid.toFixed(2)}) é maior que o valor total do evento (R$ {eventValue.toFixed(2)}).
                    </AlertDescription>
                </Alert>
            )}


            <FormField
              control={form.control}
              name="packageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pacote Contratado</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pacote Completo" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="extraDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes Extras</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhes adicionais do evento..."
                      className="resize-y min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? (event ? "Salvando..." : "Cadastrando...") : (event ? "Salvar Alterações" : "Cadastrar Evento")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
