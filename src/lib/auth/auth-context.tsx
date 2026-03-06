// src/lib/auth/auth-context.tsx
// 인증 상태 관리 컨텍스트

'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 모듈 레벨 싱글톤 — 렌더 사이클과 무관
const supabase = createClient()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // admin role 조회
    const checkAdminRole = async (userId: string | null | undefined) => {
      if (!userId) {
        setIsAdmin(false)
        return
      }
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      setIsAdmin(data?.role === 'admin')
    }

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setLoading(false)
      checkAdminRole(u?.id)
    })

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      checkAdminRole(u?.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    localStorage.setItem('auth-redirect', window.location.pathname)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    setUser(null)
    setIsAdmin(false)
    
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch {
      // ignore
    }
    
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) localStorage.removeItem(key)
      })
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) sessionStorage.removeItem(key)
      })
      window.location.reload()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
