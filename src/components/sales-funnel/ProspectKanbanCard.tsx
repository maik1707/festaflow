
"use client";

import type { Prospect, ProspectStatus } from "@/lib/prospectTypes";
import { prospectStatuses } from "@/lib/prospectTypes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProspects } from "@/contexts/ProspectContext"; // Changed to useProspects
import { ChevronDown, User, MessageSquare, Info, Edit, Trash2 } from "lucide-react"; // Adjusted icons
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation"; // For edit functionality

// TODO: Add Edit Prospect functionality - needs an edit page similar to events
// For now, Edit button can be hidden or disabled.

interface ProspectKanbanCardProps {
  prospect: Prospect;
}

export function ProspectKanbanCard({ prospect }: ProspectKanbanCardProps) {
  const { updateProspect, deleteProspect } = useProspects(); // Changed to updateProspect
  const { toast } = useToast();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangeStatus = async (newStatus: ProspectStatus) => {
    if (newStatus === prospect.status) return;
    setIsUpdating(true);
    try {
      await updateProspect(prospect.id, { status: newStatus });
      toast({
        title: "Status do Lead Atualizado",
        description: `O lead ${prospect.contactName} foi movido para ${newStatus}.`,
      });
    } catch (error) {
      console.error("Falha ao atualizar status do lead:", error);
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar o status do lead. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = () => {
    // router.push(`/prospects/${prospect.id}/edit`); // TODO: Create this page
    toast({ title: "Em Breve", description: "Funcionalidade de editar lead ainda não implementada." });
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProspect(prospect.id);
      toast({
        title: "Lead Excluído",
        description: `O lead ${prospect.contactName} foi excluído.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Falha ao excluir lead:", error);
       toast({
        title: "Erro ao Excluir",
        description: "Não foi possível excluir o lead. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow bg-card text-card-foreground">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
            <CardTitle className="text-lg text-primary">{prospect.contactName}</CardTitle>
            <CardDescription className="text-xs">
                Criado {formatDistanceToNow(prospect.createdAt, { locale: ptBR, addSuffix: true })}
            </CardDescription>
        </div>
        {/* Action buttons can go here if not in dropdown */}
        <div className="flex space-x-1">
             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEdit} disabled> {/* Disabled until edit page is ready */}
                <Edit size={14} />
                <span className="sr-only">Editar</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 size={14} />
                <span className="sr-only">Excluir</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center"><User size={14} className="mr-2 text-muted-foreground" /> {prospect.contactPlatform}: {prospect.contactDetails}</p>
        {prospect.notes && <p className="flex items-start"><Info size={14} className="mr-2 mt-0.5 text-muted-foreground flex-shrink-0" /> <span className="text-muted-foreground italic truncate hover:whitespace-normal">{prospect.notes}</span></p>}
        
        <div className="mt-3 pt-2 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full" disabled={isUpdating || isDeleting}>
                {isUpdating ? "Movendo..." : `Mover para: ${prospect.status}`} <ChevronDown size={16} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {prospectStatuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleChangeStatus(status)}
                  disabled={status === prospect.status || isUpdating || isDeleting}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
