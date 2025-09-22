import { NextResponse } from 'next/server';
import { getStoredTokens } from '@/lib/google';

export async function GET() {
  try {
    const tokens = await getStoredTokens();
    const isConnected = !!tokens && !!tokens.refresh_token;
    return NextResponse.json({ isConnected });
  } catch (error) {
    console.error('Erro ao verificar status dos tokens do Google:', error);
    return NextResponse.json({ isConnected: false }, { status: 500 });
  }
}
