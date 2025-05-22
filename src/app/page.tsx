
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // Nenhuma renderização é necessária aqui, pois o redirect() interrompe a execução.
  // No entanto, para satisfazer o tipo de retorno do React, podemos retornar null.
  return null;
}
