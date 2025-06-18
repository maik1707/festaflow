
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { EventProvider } from '@/contexts/EventContext';
import { ProspectProvider } from '@/contexts/ProspectContext';
import { PaymentProvider } from '@/contexts/PaymentContext'; // Import PaymentProvider
import { AppointmentProvider } from '@/contexts/AppointmentContext'; // Import AppointmentProvider

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
      <body className={`antialiased font-sans`}>
        <EventProvider>
          <ProspectProvider>
            <PaymentProvider>
              <AppointmentProvider> {/* Wrap with AppointmentProvider */}
                {children}
                <Toaster />
              </AppointmentProvider>
            </PaymentProvider>
          </ProspectProvider>
        </EventProvider>
      </body>
    </html>
  );
}
