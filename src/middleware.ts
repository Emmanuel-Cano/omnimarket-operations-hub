import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// Rutas privadas: todo excepto el login ("/"), el flujo OAuth y los endpoints de auditoría /api/test/*.
export default auth(req => {
  const { pathname } = req.nextUrl
  const logged = !!req.auth
  const isPublic = pathname === '/' || pathname.startsWith('/api/auth') || pathname.startsWith('/api/test')

  if (!logged && !isPublic) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
  if (logged && pathname === '/') return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  return NextResponse.next()
})

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.svg).*)'] }
