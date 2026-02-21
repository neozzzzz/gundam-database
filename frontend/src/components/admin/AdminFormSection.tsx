// src/components/admin/AdminFormSection.tsx
// Admin 폼 섹션 컴포넌트

'use client'

import { ADMIN_STYLES } from '@/lib/constants/admin-config'

interface AdminFormSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function AdminFormSection({
  title,
  children,
  className = 'mb-8',
}: AdminFormSectionProps) {
  return (
    <div className={className}>
      <h2 className={ADMIN_STYLES.sectionTitle}>{title}</h2>
      {children}
    </div>
  )
}
