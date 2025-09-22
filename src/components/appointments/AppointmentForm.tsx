"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { useAppointments } from "@/contexts/AppointmentContext";
import type { Appointment, AppointmentFormData } from "@/lib/appointmentTypes";
import { appointmentDefaultValues } from "@/lib/appointmentTypes";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";


const appointmentFormSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório." }),
  details: z.string().optional(),
  appointmentDate: z.date().nullable().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null; // Para edição
}

export function AppointmentForm({ isOpen, onOpenChange, appointment }: AppointmentFormProps) {
  const { addAppointment, updateAppointment } = useAppointments();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: appointment 
      ? { 
          title: appointment.title, 
          details: appointment.details || "", 
          appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate) : null 
        } 
      : appointmentDefaultValues,
  });

  useEffect(() => {
    if (appointment) {
      form.reset({
        title: appointment.title,
        details: appointment.details || "",
        appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate) : null,
      });
    } else {
      form.reset(appointmentDefaultValues);
    }
  }, [appointment, isOpen, form]);

  async function onSubmit(data: AppointmentFormValues) {
    setIsSubmitting(true);
    try {
      if (appointment) {
        await updateAppointment(appointment.id, data);
        toast({ title: "Compromisso Atualizado", description: "Seu compromisso foi atualizado." });
      } else {
        await addAppointment(data);
        toast({ title: "Compromisso Adicionado", description: "Novo compromisso salvo." });
      }
      onOpenChange(false);
      form.reset(appointmentDefaultValues);
    } catch (error) {
      console.error("Erro ao salvar compromisso:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o compromisso.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) form.reset(appointment ? { title: appointment.title, details: appointment.details || "", appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate) : null } : appointmentDefaultValues);
    }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{appointment ? "Editar Compromisso" : "Novo Compromisso"}</DialogTitle>
          <DialogDescription>
            {appointment ? "Edite os detalhes do seu compromisso." : "Adicione um novo lembrete ou tarefa."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Degustação Cliente X" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva mais sobre o compromisso..."
                      className="resize-y min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointmentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data e Hora (Opcional)</FormLabel>
                   <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? "Salvando..." : (appointment ? "Salvar Alterações" : "Adicionar Compromisso")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
