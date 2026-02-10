// src/components/admin/AdminPageHeader.tsx
// Admin 페이지 공통 헤더

'use client'

import Link from 'next/link'

interface AdminPageHeaderProps {
  title: string
  icon: string
  totalCount: number
  itemUnit?: string
  addButtonLabel?: string
  addButtonHref?: string
  color: {
    bgSolid?: string
    bgSolidHover?: string
    primary?: string
  }
}

export function AdminPageHeader({
  title,
  icon,
  totalCount,
  itemUnit = '개',
  addButtonLabel,
  addButtonHref,
  color,
}: AdminPageHeaderProps) {
  // 버튼 배경색: bgSolid > primary > 기본 회색
  const buttonBgColor = color.bgSolid || color.primary || '#374151'
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin"
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <img src={icon} alt={title} className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600 mt-1">총 {totalCount}{itemUnit}</p>
              </div>
            </div>
          </div>
          {addButtonLabel && addButtonHref && (
            <Link
              href={addButtonHref}
              className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: buttonBgColor }}
            >
              + {addButtonLabel}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
