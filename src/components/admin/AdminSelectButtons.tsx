// src/components/admin/AdminSelectButtons.tsx
// Admin 버튼형 선택 컴포넌트

'use client'

import { ADMIN_STYLES } from '@/lib/constants/admin-config'

interface Option {
  value: string
  label: string
  color?: string  // 옵션별 커스텀 색상 (진영 등) - 미선택 시에만 표시
}

interface AdminSelectButtonsProps {
  label: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  allowEmpty?: boolean  // 선택 해제 가능 여부
  emptyLabel?: string   // 선택 안 함 라벨
  required?: boolean
  className?: string
  scrollable?: boolean  // 스크롤 가능 여부
  accentColor?: string  // 사용하지 않음 (하위 호환용)
}

export function AdminSelectButtons({
  label,
  options,
  value,
  onChange,
  allowEmpty = true,
  emptyLabel = '선택 안 함',
  required = false,
  className = '',
  scrollable = false,
}: AdminSelectButtonsProps) {
  const handleClick = (optionValue: string) => {
    if (value === optionValue && allowEmpty) {
      onChange('')
    } else {
      onChange(optionValue)
    }
  }

  const containerClass = scrollable 
    ? 'flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg'
    : 'flex flex-wrap gap-2'

  return (
    <div className={className}>
      <label className={ADMIN_STYLES.label}>
        {label}
        {required && <span className={ADMIN_STYLES.required}>*</span>}
      </label>
      <div className={containerClass}>
        {allowEmpty && (
          <button
            type="button"
            onClick={() => onChange('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              value === ''
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {emptyLabel}
          </button>
        )}
        {options.map((option) => {
          const isSelected = value === option.value
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleClick(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
