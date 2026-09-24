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

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/student-login') &&
    !request.nextUrl.pathname.startsWith('/admin/111/admin/login') &&
    !request.nextUrl.pathname.startsWith('/staft/staft/staft/login') &&
    !request.nextUrl.pathname.startsWith('/staff/staff/staff/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/' &&
    !request.nextUrl.pathname.startsWith('/verify-id')
  ) {
    const url = request.nextUrl.clone()
    if (request.nextUrl.pathname.startsWith('/student')) {
      url.pathname = '/student-login'
    } else {
      url.pathname = '/admin/111/admin/login'
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
