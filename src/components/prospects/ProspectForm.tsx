
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProspects } from "@/contexts/ProspectContext";
import { prospectPlatforms } from "@/lib/prospectTypes";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import type { Prospect } from "@/lib/prospectTypes";

const prospectFormSchema = z.object({
  contactName: z.string().min(2, {
    message: "O nome do contato deve ter pelo menos 2 caracteres.",
  }),
  contactPlatform: z.string().min(1, {
    message: "Selecione a plataforma de contato.",
  }),
  contactDetails: z.string().min(3, {
    message: "Os detalhes do contato devem ter pelo menos 3 caracteres.",
  }),
  notes: z.string().optional(),
});

type ProspectFormValues = z.infer<typeof prospectFormSchema>;

interface ProspectFormProps {
  prospect?: Prospect; // Optional: for editing existing prospect
}

export function ProspectForm({ prospect }: ProspectFormProps) {
  const router = useRouter();
  const { addProspect, updateProspect } = useProspects();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = prospect 
    ? { ...prospect } 
    : {
        contactName: "",
        contactPlatform: "",
        contactDetails: "",
        notes: "",
      };

  const form = useForm<ProspectFormValues>({
    resolver: zodResolver(prospectFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProspectFormValues) {
    setIsSubmitting(true);
    try {
      if (prospect) {
        await updateProspect(prospect.id, data);
        toast({
          title: "Lead Atualizado!",
          description: `O lead ${data.contactName} foi atualizado com sucesso.`,
        });
        router.push("/sales-funnel");
      } else {
        const prospectId = await addProspect(data);
        toast({
          title: "Lead Cadastrado!",
          description: `O lead ${data.contactName} foi cadastrado com sucesso.`,
        });
        router.push("/sales-funnel"); // Navigate to funnel or prospect details if available
      }
    } catch (error) {
      console.error("Falha ao salvar lead:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o lead. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{prospect ? "Editar Lead" : "Cadastrar Novo Lead"}</CardTitle>
        <CardDescription>Insira as informações do cliente em potencial que entrou em contato.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Maria Silva" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactPlatform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plataforma de Contato</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a origem do contato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prospectPlatforms.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
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
                name="contactDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalhes do Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: @mariasilva ou (11) 99999-8888" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>Usuário do Instagram, telefone, email, etc.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes sobre o que o cliente procura, datas de interesse, etc."
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
              {isSubmitting ? (prospect ? "Salvando..." : "Cadastrando...") : (prospect ? "Salvar Alterações" : "Cadastrar Lead")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
