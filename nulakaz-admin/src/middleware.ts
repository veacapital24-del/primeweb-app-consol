import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieEntry = { name: string; value: string; options?: CookieOptions }

const PUBLIC_PATHS = ['/login', '/logout']

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (!url || !anon) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'config')
    return NextResponse.redirect(loginUrl)
  }

  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieEntry[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    })

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('[admin middleware] getUser:', error.message)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'session')
      const res = NextResponse.redirect(loginUrl)
      for (const c of request.cookies.getAll()) {
        if (c.name.includes('auth-token') || c.name.includes('auth-code')) {
          res.cookies.delete(c.name)
        }
      }
      return res
    }

    if (!user) {
      const returnTo = pathname + request.nextUrl.search
      const loginUrl = new URL('/login', request.url)
      if (pathname !== '/') loginUrl.searchParams.set('next', returnTo)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  } catch (err) {
    console.error('[admin middleware]', err)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'unavailable')
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|primeweb-logo|.*\\.(?:webp|png|jpg|jpeg|svg|css|js)$).*)',
  ],
}
