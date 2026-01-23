// src/components/providers.tsx
// 클라이언트 사이드 프로바이더들

'use client'

import { AuthProvider } from '@/lib/auth/auth-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
