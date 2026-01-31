'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // 로그인 페이지는 리스너 불필요
    if (pathname === '/admin/login') return

    // 로그아웃 감지 시 로그인 페이지로 이동
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/admin/login'
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, supabase, router])

  // middleware에서 이미 인증 체크 완료됨 - 바로 렌더링
  return <>{children}</>
}
