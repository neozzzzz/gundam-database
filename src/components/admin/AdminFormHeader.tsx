// src/components/admin/AdminFormHeader.tsx
// Admin 추가/수정 페이지 공통 헤더

'use client'

import Link from 'next/link'

interface AdminFormHeaderProps {
  title: string
  icon: string
  backHref: string
}

export function AdminFormHeader({
  title,
  icon,
  backHref,
}: AdminFormHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          <Link 
            href={backHref}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <img src={icon} alt={title} className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        </div>
      </div>
    </header>
  )
}
