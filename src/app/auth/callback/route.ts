// src/app/auth/callback/route.ts
// Google OAuth 콜백 처리

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (code) {
      const supabase = await createClient()
      await supabase.auth.exchangeCodeForSession(code)
    }

    // 클라이언트 사이드 리다이렉트 (localStorage에서 원래 경로 복원)
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <script>
            var next = localStorage.getItem('auth-redirect') || '/';
            localStorage.removeItem('auth-redirect');
            window.location.href = next;
          </script>
        </head>
        <body>
          <p>로그인 처리 중...</p>
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
