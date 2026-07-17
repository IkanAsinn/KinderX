import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Fetch user role from public.users table
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // RBAC Redirects
    if (isAuthRoute || request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone()
      if (role === 'admin') url.pathname = '/admin'
      else if (role === 'teacher') url.pathname = '/teacher'
      else if (role === 'parent') url.pathname = '/parent'
      else url.pathname = '/login' // Fallback
      return NextResponse.redirect(url)
    }

    // Protect role-specific routes
    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (request.nextUrl.pathname.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (request.nextUrl.pathname.startsWith('/parent') && role !== 'parent') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}
