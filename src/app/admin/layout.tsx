// src/app/admin/layout.tsx
// Admin 레이아웃 - 인증 단일화 + 빠른 체크
// V1.11: 불필요한 중복 체크 제거, 세션 캐싱

'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

// 전역 인증 상태 캐시 (페이지 이동 시 재사용)
let cachedAuthStatus: 'pending' | 'authorized' | 'unauthorized' = 'pending'
let lastCheckTime = 0
const AUTH_CACHE_DURATION = 30000 // 30초 캐시

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [authStatus, setAuthStatus] = useState<'checking' | 'authorized' | 'unauthorized'>(
    // 캐시된 인증 상태가 있고 유효하면 바로 사용
    cachedAuthStatus === 'authorized' && (Date.now() - lastCheckTime < AUTH_CACHE_DURATION)
      ? 'authorized'
      : 'checking'
  )

  const checkAuth = useCallback(async (force = false) => {
    // 로그인 페이지는 체크 불필요
    if (pathname === '/admin/login') {
      setAuthStatus('authorized')
      return
    }

    // 캐시 유효하고 강제 체크 아니면 스킵
    if (!force && cachedAuthStatus === 'authorized' && (Date.now() - lastCheckTime < AUTH_CACHE_DURATION)) {
      setAuthStatus('authorized')
      return
    }

    try {
      // getUser()가 getSession()보다 안정적 (서버 검증)
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        cachedAuthStatus = 'unauthorized'
        setAuthStatus('unauthorized')
        router.replace('/admin/login')
        return
      }

      if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        cachedAuthStatus = 'unauthorized'
        setAuthStatus('unauthorized')
        try {
          await supabase.auth.signOut({ scope: 'local' })
        } catch (e) {}
        router.replace('/admin/login')
        return
      }

      // 인증 성공 - 캐시 업데이트
      cachedAuthStatus = 'authorized'
      lastCheckTime = Date.now()
      setAuthStatus('authorized')
      
    } catch (error) {
      console.error('인증 확인 오류:', error)
      cachedAuthStatus = 'unauthorized'
      setAuthStatus('unauthorized')
      router.replace('/admin/login')
    }
  }, [pathname, router, supabase])

  useEffect(() => {
    // 로그인 페이지는 바로 통과
    if (pathname === '/admin/login') {
      setAuthStatus('authorized')
      return
    }

    checkAuth()

    // 세션 변경 감지 (로그아웃 등)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        cachedAuthStatus = 'unauthorized'
        lastCheckTime = 0
        setAuthStatus('unauthorized')
        router.replace('/admin/login')
      } else if (event === 'SIGNED_IN') {
        // 로그인 시 캐시 갱신
        checkAuth(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, checkAuth, router, supabase])

  // 로그인 페이지는 바로 렌더링
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // 체크 중이면 간단한 로딩 (최소한의 UI)
  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  // 권한 없으면 빈 화면 (redirect 중)
  if (authStatus === 'unauthorized') {
    return null
  }

  return <>{children}</>
}
