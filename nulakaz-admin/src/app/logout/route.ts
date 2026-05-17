import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type CookieEntry = { name: string; value: string; options?: CookieOptions }

async function handle(request: NextRequest) {
  const redirect = NextResponse.redirect(new URL('/login?signed_out=1', request.url))

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies: CookieEntry[]) => {
        for (const { name, value, options } of cookies) {
          redirect.cookies.set(name, value, options)
        }
      },
    },
  })

  await supabase.auth.signOut()
  return redirect
}

export async function GET(req: NextRequest)  { return handle(req) }
export async function POST(req: NextRequest) { return handle(req) }
