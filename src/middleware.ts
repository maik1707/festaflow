
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session'; // Usaremos getSession em vez de decrypt diretamente

const protectedRoutes = ['/dashboard', '/events', '/calendar', '/prospects', '/sales-funnel', '/payments', '/financials'];
const publicRoutes = ['/login']; // Rotas que não precisam de autenticação

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar assets e rotas da API do Next.js
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg')
  ) {
    return NextResponse.next();
  }

  const session = await getSession();

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!session && isProtectedRoute) {
    // Se não há sessão e a rota é protegida, redireciona para login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname); // Opcional: para redirecionar de volta após o login
    return NextResponse.redirect(loginUrl);
  }

  if (session && pathname === '/login') {
    // Se há sessão e o usuário tenta acessar /login, redireciona para o dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Define as rotas que o middleware deve interceptar
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de solicitação, exceto aqueles que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico (arquivo de favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
