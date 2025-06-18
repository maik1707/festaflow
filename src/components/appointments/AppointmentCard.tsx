
"use client";

import type { Appointment } from "@/lib/appointmentTypes";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppointments } from "@/contexts/AppointmentContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Edit, Trash2, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: () => void;
}

export function AppointmentCard({ appointment, onEdit }: AppointmentCardProps) {
  const { deleteAppointment, toggleComplete } = useAppointments();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAppointment(appointment.id);
      toast({ title: "Compromisso Excluído", description: "O compromisso foi removido." });
    } catch (error) {
      toast({ title: "Erro ao Excluir", description: "Não foi possível excluir o compromisso.", variant: "destructive" });
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleComplete = async () => {
    setIsToggling(true);
    try {
      await toggleComplete(appointment.id, !appointment.isCompleted);
      toast({ 
        title: `Compromisso ${!appointment.isCompleted ? "Concluído" : "Reaberto"}`,
        description: `O compromisso "${appointment.title}" foi marcado como ${!appointment.isCompleted ? "concluído" : "pendente"}.`
      });
    } catch (error) {
      toast({ title: "Erro ao Atualizar", description: "Não foi possível atualizar o status do compromisso.", variant: "destructive" });
      console.error(error);
    } finally {
      setIsToggling(false);
    }
  };
  
  const cardBgColor = appointment.isCompleted ? "bg-card/50" : "bg-card";
  const titleColor = appointment.isCompleted ? "text-muted-foreground line-through" : "text-primary";

  return (
    <Card className={`mb-4 shadow-md hover:shadow-lg transition-shadow ${cardBgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className={`text-lg ${titleColor}`}>{appointment.title}</CardTitle>
          <Checkbox
            id={`complete-${appointment.id}`}
            checked={appointment.isCompleted}
            onCheckedChange={handleToggleComplete}
            disabled={isToggling || isDeleting}
            aria-label="Marcar como concluído"
            className="mt-1"
          />
        </div>
        {appointment.appointmentDate && (
          <CardDescription className="text-xs flex items-center">
            <Calendar size={12} className="inline mr-1" />
            {format(new Date(appointment.appointmentDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </CardDescription>
        )}
      </CardHeader>
      {appointment.details && (
        <CardContent className="pb-3">
          <p className={`text-sm ${appointment.isCompleted ? 'text-muted-foreground/70' : 'text-foreground/90'}`}>
            {appointment.details}
          </p>
        </CardContent>
      )}
      <CardFooter className="flex justify-end gap-2 pt-3 border-t">
        <Button variant="outline" size="sm" onClick={onEdit} disabled={isDeleting || isToggling}>
          <Edit size={14} className="mr-1" /> Editar
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting || isToggling}>
              <Trash2 size={14} className="mr-1" /> Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o compromisso "{appointment.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
