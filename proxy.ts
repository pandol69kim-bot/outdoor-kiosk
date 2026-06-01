import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isAdminLoginPage = request.nextUrl.pathname === '/admin/login'
  const isWholesalerPath = request.nextUrl.pathname.startsWith('/wholesaler')
  const isWholesalerLoginPage = request.nextUrl.pathname === '/wholesaler/login'

  let wholesalerByEmail: { id: string } | null = null
  if (user?.email && (isAdminPath || isWholesalerPath)) {
    const { data } = await supabase
      .from('wholesalers')
      .select('id')
      .ilike('email', user.email.trim().toLowerCase())
      .maybeSingle()
    wholesalerByEmail = data
  }

  if (isAdminPath && !isAdminLoginPage && !user) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminPath && !isAdminLoginPage && wholesalerByEmail) {
    const ordersUrl = new URL('/wholesaler/orders', request.url)
    return NextResponse.redirect(ordersUrl)
  }

  if (isAdminLoginPage && user && !wholesalerByEmail) {
    const dashboardUrl = new URL('/admin', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  if (isWholesalerPath && !isWholesalerLoginPage && !user) {
    const loginUrl = new URL('/wholesaler/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (isWholesalerPath && !isWholesalerLoginPage && user && !wholesalerByEmail) {
    const loginUrl = new URL('/wholesaler/login', request.url)
    loginUrl.searchParams.set('error', 'not_wholesaler')
    return NextResponse.redirect(loginUrl)
  }

  if (isWholesalerLoginPage && wholesalerByEmail) {
    const dashboardUrl = new URL('/wholesaler/orders', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/wholesaler/:path*'],
}