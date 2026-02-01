// src/components/admin/AdminSubmitButtons.tsx
// Admin 폼 제출 버튼 컴포넌트

'use client'

import Link from 'next/link'

interface AdminSubmitButtonsProps {
  saving: boolean
  savingText?: string
  submitText?: string
  cancelHref: string
  cancelText?: string
  accentColor?: string  // tailwind class 예: 'bg-green-600'
  accentHoverColor?: string  // tailwind class 예: 'hover:bg-green-700'
}

export function AdminSubmitButtons({
  saving,
  savingText = '저장 중...',
  submitText = '저장',
  cancelHref,
  cancelText = '취소',
  accentColor = 'bg-gray-900',
  accentHoverColor = 'hover:bg-gray-800',
}: AdminSubmitButtonsProps) {
  return (
    <div className="flex gap-4">
      <button
        type="submit"
        disabled={saving}
        className={`flex-1 px-6 py-3 ${accentColor} text-white font-medium rounded-lg ${accentHoverColor} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        {saving ? savingText : submitText}
      </button>
      <Link
        href={cancelHref}
        className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-center flex items-center justify-center"
      >
        {cancelText}
      </Link>
    </div>
  )
}
