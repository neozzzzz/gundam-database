// src/components/admin-auth-guard.tsx
// AdminAuthGuard 컴포넌트
// V1.11: layout.tsx에서 인증 처리하므로 단순 패스스루로 변경
// 기존 코드 호환성을 위해 유지

'use client'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

/**
 * @deprecated layout.tsx에서 인증을 처리하므로 더 이상 필요 없음
 * 기존 코드 호환성을 위해 children만 렌더링
 */
export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  // layout.tsx에서 이미 인증을 처리하므로
  // 여기서는 단순히 children만 렌더링
  return <>{children}</>
}
