// src/app/api/auth/callback/route.ts
// Google OAuth 콜백 처리

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    
    // OAuth 코드를 세션으로 교환
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 로그인 후 메인 페이지로 리디렉션
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
