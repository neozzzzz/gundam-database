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

      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return

        if (!session) {
          if (!hasRedirected.current) {
            hasRedirected.current = true
            setStatus('unauthorized')
            window.location.replace('/admin/login')
          }
          return
        }

        if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          if (!hasRedirected.current) {
            hasRedirected.current = true
            setStatus('unauthorized')
            try {
              await supabase.auth.signOut({ scope: 'local' })
            } catch (e) {}
            window.location.replace('/admin/login')
          }
          return
        }

        setStatus('authorized')
      } catch (error) {
        console.error('Auth check error:', error)
        if (isMounted && !hasRedirected.current) {
          hasRedirected.current = true
          setStatus('unauthorized')
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
