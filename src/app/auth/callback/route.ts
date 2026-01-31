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

    // 클라이언트 사이드 리다이렉트 (쿠키 설정 시간 확보)
    const redirectUrl = new URL(next, requestUrl.origin).toString()
    
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <script>window.location.href="${redirectUrl}";</script>
        </head>
        <body>
          <p>로그인 처리 중... 자동으로 이동하지 않으면 <a href="${redirectUrl}">여기</a>를 클릭하세요.</p>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const dynamic = 'force-dynamic'
