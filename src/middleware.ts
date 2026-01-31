import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 세션 갱신 (쿠키 기반)
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // /admin/login 페이지는 통과
  if (pathname === '/admin/login') {
    // 이미 로그인된 관리자라면 /admin으로 리다이렉트
    if (session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return res
  }

  // /admin 하위 페이지 접근 시 인증 체크
  if (pathname.startsWith('/admin')) {
    // 세션이 없으면 로그인 페이지로
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // 관리자 이메일이 아니면 로그인 페이지로
    if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      // 세션은 있지만 관리자가 아닌 경우 - 로그아웃 후 리다이렉트
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
