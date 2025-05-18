
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
import { Sparkles } from "lucide-react";
import { suggestEventDetails } from "@/ai/flows/suggest-event-details-flow";
import type { SuggestEventDetailsInput } from "@/ai/flows/suggest-event-details-flow";

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
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const defaultValues = event 
    ? { 
        ...event, 
        guestCount: Number(event.guestCount), 
        eventValue: Number(event.eventValue) 
      } 
    : {
        coupleName: "",
        eventDate: undefined,
        location: "",
        guestCount: 0,
        eventValue: 0,
        packageName: "",
        extraDetails: "",
      };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  // Watch for changes in packageName or coupleName to clear AI suggestions
  const watchedPackageName = form.watch("packageName");
  const watchedCoupleName = form.watch("coupleName");

  useEffect(() => {
    setAiSuggestions([]);
  }, [watchedPackageName, watchedCoupleName]);

  async function onSubmit(data: EventFormValues) {
    setIsSubmitting(true);
    const formattedData = {
      ...data,
      eventDate: format(data.eventDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
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

  const handleAiSuggest = async () => {
    setIsAiSuggesting(true);
    setAiSuggestions([]);
    const currentPackageName = form.getValues("packageName");
    const currentCoupleName = form.getValues("coupleName");

    if (!currentPackageName && !currentCoupleName) {
        toast({
            title: "Contexto Insuficiente",
            description: "Por favor, preencha o nome do pacote ou do casal para obter sugestões.",
            variant: "destructive"
        });
        setIsAiSuggesting(false);
        return;
    }

    try {
      const input: SuggestEventDetailsInput = {
        packageName: currentPackageName || "Não especificado",
        coupleName: currentCoupleName || "Cliente",
      };
      const result = await suggestEventDetails(input);
      setAiSuggestions(result.suggestions);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      toast({
        title: "Erro na Sugestão",
        description: "Não foi possível buscar sugestões da IA. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const appendSuggestionToDetails = (suggestion: string) => {
    const currentDetails = form.getValues("extraDetails") || "";
    const newDetails = currentDetails ? `${currentDetails}\n- ${suggestion}` : `- ${suggestion}`;
    form.setValue("extraDetails", newDetails, { shouldValidate: true });
  };

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
                      <Input placeholder="Ex: João & Maria" {...field} disabled={isSubmitting || isAiSuggesting} />
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
                    <Input placeholder="Ex: Salão Festa Linda" {...field} disabled={isSubmitting || isAiSuggesting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Convidados</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 100" {...field} disabled={isSubmitting || isAiSuggesting} />
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
                    <FormLabel>Valor do Evento (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 5000.00" {...field} disabled={isSubmitting || isAiSuggesting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="packageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pacote Contratado</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pacote Completo" {...field} disabled={isSubmitting || isAiSuggesting} />
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
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel>Detalhes Extras</FormLabel>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAiSuggest} 
                        disabled={isAiSuggesting || isSubmitting || (!form.getValues("packageName") && !form.getValues("coupleName"))}
                    >
                        <Sparkles className="mr-2 h-4 w-4" /> 
                        {isAiSuggesting ? "Sugerindo..." : "Sugerir com IA"}
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhes adicionais do evento..."
                      className="resize-y min-h-[100px]"
                      {...field}
                      disabled={isSubmitting || isAiSuggesting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {aiSuggestions.length > 0 && (
                <Card className="p-4 bg-muted/50">
                    <CardDescription className="mb-2 text-sm">Sugestões da IA (clique para adicionar):</CardDescription>
                    <div className="flex flex-wrap gap-2">
                        {aiSuggestions.map((suggestion, index) => (
                            <Button 
                                key={index} 
                                type="button" 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => appendSuggestionToDetails(suggestion)}
                                className="bg-accent text-accent-foreground hover:bg-accent/90"
                            >
                                {suggestion}
                            </Button>
                        ))}
                    </div>
                </Card>
            )}
            
            <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || isAiSuggesting}>
              {isSubmitting ? (event ? "Salvando..." : "Cadastrando...") : (event ? "Salvar Alterações" : "Cadastrar Evento")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

