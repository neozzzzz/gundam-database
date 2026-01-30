// src/app/auth/callback/route.ts
// Google OAuth 콜백 처리

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (code) {
      const cookieStore = await cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      await supabase.auth.exchangeCodeForSession(code)
    }

    // next 파라미터로 리다이렉트 (기본값: 메인 페이지)
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (error) {
    console.error('Auth callback error:', error)
    // 에러가 나면 메인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const dynamic = 'force-dynamic'
