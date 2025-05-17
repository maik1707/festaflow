import type { Metadata } from 'next';
// Removed: import { GeistSans } from 'geist/font/sans';
// Removed: import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { EventProvider } from '@/contexts/EventContext';

// Removed: const geistSans = GeistSans;
// Removed: const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'FestaFlow - Gestão de Eventos',
  description: 'Gerencie seus eventos de forma fácil e eficiente com FestaFlow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`antialiased font-sans`}> {/* Removed geistSans.variable and geistMono.variable */}
        <EventProvider>
          {children}
          <Toaster />
        </EventProvider>
      </body>
    </html>
  );
}
