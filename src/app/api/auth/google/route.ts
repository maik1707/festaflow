import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google';

export async function GET() {
  try {
    const url = getGoogleAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação do Google:', error);
    // Redireciona para uma página de erro ou de volta para as configurações com uma mensagem de erro
    const settingsUrl = new URL('/settings', process.env.NEXT_PUBLIC_BASE_URL);
    settingsUrl.searchParams.set('error', 'google_auth_failed');
    return NextResponse.redirect(settingsUrl);
  }
}
