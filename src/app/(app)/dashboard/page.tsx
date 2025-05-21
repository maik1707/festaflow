
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarPlus, CalendarDays, ListChecks, DollarSign, UserPlus } from 'lucide-react'; // Added UserPlus
import Image from 'next/image';

const featureCards = [
  {
    title: 'Cadastrar Novo Evento',
    description: 'Registre os detalhes de um novo evento confirmado.',
    href: '/events/new',
    icon: CalendarPlus,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'event planning',
  },
   {
    title: 'Cadastrar Novo Lead',
    description: 'Adicione um novo cliente em potencial ao funil.',
    href: '/prospects/new',
    icon: UserPlus,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'new contact',
  },
  {
    title: 'Calendário de Eventos',
    description: 'Visualize todos os eventos agendados.',
    href: '/calendar',
    icon: CalendarDays,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'calendar schedule',
  },
  {
    title: 'Funil de Leads', // Renamed
    description: 'Acompanhe o progresso dos seus leads.',
    href: '/sales-funnel',
    icon: ListChecks,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'sales chart',
  },
  {
    title: 'Controle Financeiro',
    description: 'Gerencie as finanças dos seus eventos.',
    href: '/financials',
    icon: DollarSign,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'finance money',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Bem-vindo ao FestaFlow!</CardTitle>
          <CardDescription className="text-lg">Sua plataforma completa para gerenciamento de eventos e leads. Comece a organizar de forma eficiente e elegante.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Utilize os cartões abaixo para navegar pelas principais funcionalidades do sistema.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Adjusted for 5 cards, can be 2 or 3 per row */}
        {featureCards.map((feature) => (
          <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="flex-row items-center gap-4 pb-4">
              <feature.icon className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
               <div className="relative aspect-video w-full mb-4 rounded-md overflow-hidden">
                 <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={feature.aiHint} 
                 />
               </div>
              <Button asChild className="w-full mt-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href={feature.href}>
                  Acessar {feature.title.split(' ')[0]}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
