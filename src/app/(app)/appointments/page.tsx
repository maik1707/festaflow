
"use client";

import { useState } from "react";
import { useAppointments } from "@/contexts/AppointmentContext";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlusCircle, ListFilter, StickyNote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Appointment } from "@/lib/appointmentTypes";

type FilterStatus = "all" | "pending" | "completed";

export default function AppointmentsPage() {
  const { appointments, loading } = useAppointments();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");

  const handleOpenForm = (appointmentToEdit?: Appointment) => {
    setEditingAppointment(appointmentToEdit || null);
    setIsFormOpen(true);
  };

  const filteredAppointments = appointments.filter(app => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return !app.isCompleted;
    if (filterStatus === "completed") return app.isCompleted;
    return true;
  }).sort((a, b) => {
    // Ordenar por data do compromisso (se houver), mais próximos primeiro
    // Compromissos sem data vêm depois
    if (a.appointmentDate && b.appointmentDate) {
      return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
    }
    if (a.appointmentDate) return -1; // a tem data, b não
    if (b.appointmentDate) return 1;  // b tem data, a não
    // Se ambos não têm data, ordenar por data de criação (mais recentes primeiro)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });


  if (loading && appointments.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-36" />
          </CardHeader>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center"><StickyNote className="mr-2 h-7 w-7 text-primary" /> Compromissos</CardTitle>
            <CardDescription>
              Gerencie seus lembretes, degustações, visitas técnicas e outras tarefas.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Compromisso
          </Button>
        </CardHeader>
      </Card>

      <div className="flex justify-end items-center">
          <div className="flex items-center gap-2">
            <ListFilter size={18} className="text-muted-foreground" />
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                </SelectContent>
            </Select>
          </div>
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onEdit={() => handleOpenForm(appointment)}
            />
          ))}
        </div>
      ) : (
        <Card>
            <CardContent className="pt-6 text-center">
                <StickyNote size={48} className="mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground">
                    {filterStatus === "pending" && "Nenhum compromisso pendente."}
                    {filterStatus === "completed" && "Nenhum compromisso concluído."}
                    {filterStatus === "all" && "Nenhum compromisso cadastrado ainda."}
                </p>
                {filterStatus !== "all" && appointments.length > 0 && (
                     <p className="text-sm text-muted-foreground mt-1">
                        Verifique outros filtros ou adicione um novo compromisso.
                    </p>
                )}
                 {appointments.length === 0 && (
                     <Button onClick={() => handleOpenForm()} className="mt-4">
                        <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Primeiro Compromisso
                    </Button>
                )}
            </CardContent>
        </Card>
      )}

      <AppointmentForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        appointment={editingAppointment}
      />
    </div>
  );
}
