import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar se o usuário está tentando acessar rotas protegidas
  if (request.nextUrl.pathname.startsWith('/app')) {
    // Verificar se existe um token no cookie ou localStorage
    const token = request.cookies.get('auth_token')?.value;
    
    // Se não houver token, redirecionar para a página de login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};