import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from './lib/supabase/middleware'

const protectedRoutes = ['/dashboard', '/admin']
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // If user is not logged in and trying to access protected route
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in
  if (session) {
    // Verify user exists in database and has admin access
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('is_active, is_admin')
      .eq('email', session.user.email)
      .single()

    // If user doesn't exist in database or is not active, log them out
    if (error || !user || !user.is_active || !user.is_admin) {
      await supabase.auth.signOut()
      // Redirect to login with error message
      const url = new URL('/login', request.url)
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }

    // If user is trying to access auth route, redirect to dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
