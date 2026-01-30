'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const hasChecked = useRef(false)

  useEffect(() => {
    // 로그인 페이지는 체크 불필요
    if (pathname === '/admin/login') {
      setIsChecking(false)
      setIsAuthorized(true)
      return
    }

    // 이미 체크했으면 스킵
    if (hasChecked.current && isAuthorized) {
      return
    }

    checkAuth()

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthorized(false)
        hasChecked.current = false
        router.replace('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setIsAuthorized(false)
        router.replace('/admin/login')
        return
      }

      if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        try {
          await supabase.auth.signOut({ scope: 'local' })
        } catch (e) {}
        setIsAuthorized(false)
        router.replace('/admin/login')
        return
      }

      setIsAuthorized(true)
      hasChecked.current = true
    } catch (error) {
      console.error('인증 확인 오류:', error)
      setIsAuthorized(false)
      router.replace('/admin/login')
    } finally {
      setIsChecking(false)
    }
  }

  // 로그인 페이지는 바로 렌더링
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // 체크 중이면 로딩 표시
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // 권한 없으면 빈 화면 (redirect 중)
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
