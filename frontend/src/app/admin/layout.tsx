// src/app/admin/layout.tsx
// Admin 레이아웃 - 인증은 middleware에서 처리
// V2.0: 서버사이드 인증으로 전환 (middleware.ts)

'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 로그인 페이지는 감시 불필요
    if (pathname === '/admin/login') return

    // 세션 변경 감지 (로그아웃 시 리디렉트)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  return <>{children}</>
}
