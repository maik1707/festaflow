
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

// Helper function to parse currency string to number
const parseCurrency = (value: string | number | undefined): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== "") {
    // Remove R$, espaços, e pontos de milhar (exceto se for o único ponto, tratando como decimal)
    let cleanedValue = value.replace(/R\$\s*/g, '').trim();
    
    // Padroniza separador de milhar para '' e decimal para '.'
    if (cleanedValue.includes(',') && cleanedValue.includes('.')) { // Ex: 1.234,56 ou 1,234.56
      if (cleanedValue.lastIndexOf('.') < cleanedValue.lastIndexOf(',')) { // Formato PT: 1.234,56
        cleanedValue = cleanedValue.replace(/\./g, '').replace(',', '.');
      } else { // Formato EN: 1,234.56
        cleanedValue = cleanedValue.replace(/,/g, '');
      }
    } else if (cleanedValue.includes(',')) { // Apenas vírgula: 1234,56
      cleanedValue = cleanedValue.replace(',', '.');
    }
    // Se tiver apenas pontos e mais de um, remover todos menos o último se for decimal
    // Ex: "1.234.567" (sem decimal claro) -> "1234567"
    // Ex: "1.234.50" (com decimal claro) -> "1234.50"
    // This part is tricky. Let's assume for now that if multiple dots exist, they are thousand separators
    // unless it's a clear decimal format like X.XX
    if (cleanedValue.split('.').length > 2) {
        const parts = cleanedValue.split('.');
        const lastPart = parts.pop();
        if (lastPart && lastPart.length <= 2) { // Assume last part is decimal if 2 or less digits
            cleanedValue = parts.join('') + '.' + lastPart;
        } else if (lastPart) { // Otherwise, assume all are thousand separators
             cleanedValue = parts.join('') + lastPart;
        }
    }


    const num = parseFloat(cleanedValue);
    return isNaN(num) ? null : num;
  }
  if (typeof value === 'string' && value.trim() === "") return 0; // Consider empty string as 0 for event value initially
  return null;
};


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
  guestCount: z.coerce.number().int().min(0, { // Allow 0 guests
    message: "O número de convidados deve ser um número não negativo.",
  }),
  eventValue: z.string().min(1, {
    message: "O valor do evento é obrigatório.",
  }),
  packageName: z.string().min(2, {
    message: "O nome do pacote deve ter pelo menos 2 caracteres.",
  }),
  extraDetails: z.string().optional(),
  amountPaid: z.number().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event;
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
        eventValue: event.eventValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\s/g, ''), // Format as string for input
        amountPaid: Number(event.amountPaid || 0)
      }
    : {
        coupleName: "",
        eventDate: undefined,
        location: "",
        guestCount: 0,
        eventValue: "", // Initialize as empty string
        packageName: "",
        extraDetails: "",
        amountPaid: 0,
      };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (event) {
      form.reset({
        ...event,
        guestCount: Number(event.guestCount),
        eventValue: event.eventValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\s/g, ''),
        amountPaid: Number(event.amountPaid || 0),
        eventDate: new Date(event.eventDate), // Make sure date is a Date object
      });
    }
  }, [event, form]);


  async function onSubmit(data: EventFormValues) {
    setIsSubmitting(true);

    const parsedEventValue = parseCurrency(data.eventValue);

    if (parsedEventValue === null || parsedEventValue < 0) {
      toast({
        title: "Valor Inválido",
        description: "O valor total do evento inserido não é válido ou é negativo. Por favor, corrija.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      form.setError("eventValue", { type: "manual", message: "Valor inválido ou negativo." });
      return;
    }

    const { amountPaid, eventValue, ...eventDataToSubmit } = data;

    const formattedData = {
      ...eventDataToSubmit,
      guestCount: Number(data.guestCount), // Ensure guestCount is number
      eventDate: format(data.eventDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      eventValue: parsedEventValue,
    };

    try {
      if (event) {
        await updateEvent(event.id, formattedData);
        toast({
          title: "Evento Atualizado!",
          description: `O evento de ${data.coupleName} foi atualizado com sucesso.`,
        });
      } else {
        await addEvent(formattedData);
        toast({
          title: "Evento Cadastrado!",
          description: `O evento de ${data.coupleName} foi cadastrado com sucesso.`,
        });
      }
      router.push("/calendar");
    } catch (error) {
      let errorMessage = "Não foi possível salvar o evento. Tente novamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Failed to save event:", error);
      toast({
        title: "Erro ao Salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentAmountPaid = form.watch('amountPaid') || 0;
  const eventValueString = form.watch('eventValue') || "";
  const currentEventValueForDisplay = parseCurrency(eventValueString) ?? 0;
  const remainingBalance = currentEventValueForDisplay - currentAmountPaid;

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
                      <Input 
                        type="number" 
                        placeholder="Ex: 100" 
                        {...field}
                        value={field.value === 0 && !form.formState.dirtyFields.guestCount && !event ? '' : field.value} // Show empty if 0 and not dirty/editing
                        onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                        disabled={isSubmitting} />
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
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex: 5000,00 ou 5.000"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormItem>
                <FormLabel>Valor Pago (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="text" // Changed to text for display formatting
                    value={currentAmountPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </FormControl>
                 <FormDescription>
                    Saldo Devedor: R$ {remainingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </FormDescription>
              </FormItem>
            </div>

            {currentAmountPaid > currentEventValueForDisplay && currentEventValueForDisplay > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção!</AlertTitle>
                    <AlertDescription>
                    O valor pago (R$ {currentAmountPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) é maior que o valor total do evento (R$ {currentEventValueForDisplay.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).
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

    