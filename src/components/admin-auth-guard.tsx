'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useRef } from 'react'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')
  const supabase = createClientComponentClient()
  const hasRedirected = useRef(false)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      // 이미 리다이렉트 했으면 스킵
      if (hasRedirected.current) return

      // 리다이렉트 루프 감지
      const redirectCount = parseInt(sessionStorage.getItem('admin_redirect_count') || '0')
      if (redirectCount > 2) {
        console.error('Redirect loop detected, stopping')
        sessionStorage.removeItem('admin_redirect_count')
        setStatus('unauthorized')
        return
      }

      try {
        // getUser()가 getSession()보다 더 안정적
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (!isMounted) return

        if (error || !user) {
          if (!hasRedirected.current) {
            hasRedirected.current = true
            setStatus('unauthorized')
            sessionStorage.setItem('admin_redirect_count', String(redirectCount + 1))
            window.location.replace('/admin/login')
          }
          return
        }

        if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          if (!hasRedirected.current) {
            hasRedirected.current = true
            setStatus('unauthorized')
            try {
              await supabase.auth.signOut({ scope: 'local' })
            } catch (e) {}
            sessionStorage.setItem('admin_redirect_count', String(redirectCount + 1))
            window.location.replace('/admin/login')
          }
          return
        }

        // 인증 성공 - 카운터 리셋
        sessionStorage.removeItem('admin_redirect_count')
        setStatus('authorized')
      } catch (error) {
        console.error('Auth check error:', error)
        if (isMounted && !hasRedirected.current) {
          hasRedirected.current = true
          setStatus('unauthorized')
          sessionStorage.setItem('admin_redirect_count', String(redirectCount + 1))
          window.location.replace('/admin/login')
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [supabase])

  // 로딩 중이거나 미인증 상태면 로딩 화면
  if (status !== 'authorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
